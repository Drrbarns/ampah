-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_branch_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE deceased_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BRANCHES
-- ============================================================================

-- Super admin can see all branches, others can see branches they're assigned to
CREATE POLICY "Super admin can view all branches"
  ON branches FOR SELECT
  USING (auth_is_super_admin());

CREATE POLICY "Users can view assigned branches"
  ON branches FOR SELECT
  USING (auth_user_has_branch(id));

CREATE POLICY "Super admin can manage branches"
  ON branches FOR ALL
  USING (auth_is_super_admin())
  WITH CHECK (auth_is_super_admin());

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Super admin can view all profiles
CREATE POLICY "Super admin can view all profiles"
  ON profiles FOR SELECT
  USING (auth_is_super_admin());

-- Branch admins can view profiles of users in their branches
CREATE POLICY "Branch admin can view branch staff"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_branch_assignments uba
      INNER JOIN profiles p ON p.id = uba.user_id
      WHERE uba.branch_id IN (
        SELECT branch_id FROM user_branch_assignments
        WHERE user_id = auth.uid()
      )
      AND p.id = profiles.id
      AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin')
      )
    )
  );

-- Super admin can manage all profiles
CREATE POLICY "Super admin can manage profiles"
  ON profiles FOR ALL
  USING (auth_is_super_admin())
  WITH CHECK (auth_is_super_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Can't change own role
  );

-- ============================================================================
-- USER_BRANCH_ASSIGNMENTS
-- ============================================================================

-- Super admin can view all assignments
CREATE POLICY "Super admin can view all assignments"
  ON user_branch_assignments FOR SELECT
  USING (auth_is_super_admin());

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments"
  ON user_branch_assignments FOR SELECT
  USING (user_id = auth.uid());

-- Branch admins can view assignments for their branches
CREATE POLICY "Branch admin can view branch assignments"
  ON user_branch_assignments FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM user_branch_assignments
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin')
    )
  );

-- Super admin can manage all assignments
CREATE POLICY "Super admin can manage assignments"
  ON user_branch_assignments FOR ALL
  USING (auth_is_super_admin())
  WITH CHECK (auth_is_super_admin());

-- ============================================================================
-- SERVICES_CATALOG
-- ============================================================================

-- Super admin can view all services
CREATE POLICY "Super admin can view all services"
  ON services_catalog FOR SELECT
  USING (auth_is_super_admin());

-- Users can view services in their branches
CREATE POLICY "Users can view branch services"
  ON services_catalog FOR SELECT
  USING (auth_user_has_branch(branch_id));

-- Super admin and branch admin can manage services
CREATE POLICY "Admins can manage services"
  ON services_catalog FOR ALL
  USING (
    auth_is_super_admin()
    OR (
      auth_user_has_branch(branch_id)
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin'))
    )
  )
  WITH CHECK (
    auth_is_super_admin()
    OR (
      auth_user_has_branch(branch_id)
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin'))
    )
  );

-- ============================================================================
-- DECEASED_CASES
-- ============================================================================

-- Super admin can view all cases
CREATE POLICY "Super admin can view all cases"
  ON deceased_cases FOR SELECT
  USING (auth_is_super_admin());

-- Users can view cases in their branches
CREATE POLICY "Users can view branch cases"
  ON deceased_cases FOR SELECT
  USING (auth_user_has_branch(branch_id));

-- Staff+ can insert cases in their branches
CREATE POLICY "Staff can create cases"
  ON deceased_cases FOR INSERT
  WITH CHECK (
    auth_is_super_admin()
    OR auth_user_has_branch(branch_id)
  );

-- Staff+ can update cases in their branches
CREATE POLICY "Staff can update cases"
  ON deceased_cases FOR UPDATE
  USING (
    auth_is_super_admin()
    OR auth_user_has_branch(branch_id)
  )
  WITH CHECK (
    auth_is_super_admin()
    OR auth_user_has_branch(branch_id)
  );

-- Super admin and branch admin can delete/archive cases
CREATE POLICY "Admins can delete cases"
  ON deceased_cases FOR DELETE
  USING (
    auth_is_super_admin()
    OR (
      auth_user_has_branch(branch_id)
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin'))
    )
  );

-- ============================================================================
-- CASE_CHARGES
-- ============================================================================

-- Super admin can view all charges
CREATE POLICY "Super admin can view all charges"
  ON case_charges FOR SELECT
  USING (auth_is_super_admin());

-- Users can view charges for cases in their branches
CREATE POLICY "Users can view branch charges"
  ON case_charges FOR SELECT
  USING (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = case_charges.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- Staff+ can insert charges
CREATE POLICY "Staff can create charges"
  ON case_charges FOR INSERT
  WITH CHECK (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = case_charges.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- Staff+ can update charges
CREATE POLICY "Staff can update charges"
  ON case_charges FOR UPDATE
  USING (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = case_charges.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  )
  WITH CHECK (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = case_charges.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- Staff+ can delete charges
CREATE POLICY "Staff can delete charges"
  ON case_charges FOR DELETE
  USING (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = case_charges.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- Super admin can view all payments
CREATE POLICY "Super admin can view all payments"
  ON payments FOR SELECT
  USING (auth_is_super_admin());

-- Users can view payments for cases in their branches
CREATE POLICY "Users can view branch payments"
  ON payments FOR SELECT
  USING (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = payments.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- Staff+ can insert payments (cashier permission check can be added later)
CREATE POLICY "Staff can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = payments.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- Staff+ can update payments
CREATE POLICY "Staff can update payments"
  ON payments FOR UPDATE
  USING (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = payments.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  )
  WITH CHECK (
    auth_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM deceased_cases dc
      WHERE dc.id = payments.case_id
      AND auth_user_has_branch(dc.branch_id)
    )
  );

-- Admins can delete payments (should be rare)
CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (
    auth_is_super_admin()
    OR (
      EXISTS (
        SELECT 1 FROM deceased_cases dc
        WHERE dc.id = payments.case_id
        AND auth_user_has_branch(dc.branch_id)
      )
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin'))
    )
  );

-- ============================================================================
-- RECEIPT_SEQUENCES
-- ============================================================================

-- Super admin can view all sequences
CREATE POLICY "Super admin can view all sequences"
  ON receipt_sequences FOR SELECT
  USING (auth_is_super_admin());

-- Users can view sequences for their branches
CREATE POLICY "Users can view branch sequences"
  ON receipt_sequences FOR SELECT
  USING (auth_user_has_branch(branch_id));

-- Staff+ can update sequences (via generate_receipt_number function)
CREATE POLICY "Staff can update sequences"
  ON receipt_sequences FOR UPDATE
  USING (auth_user_has_branch(branch_id))
  WITH CHECK (auth_user_has_branch(branch_id));

-- Staff+ can insert sequences
CREATE POLICY "Staff can insert sequences"
  ON receipt_sequences FOR INSERT
  WITH CHECK (auth_user_has_branch(branch_id));

-- ============================================================================
-- AUDIT_LOGS
-- ============================================================================

-- Super admin can view all audit logs
CREATE POLICY "Super admin can view all audit logs"
  ON audit_logs FOR SELECT
  USING (auth_is_super_admin());

-- Users can view audit logs for their branches
CREATE POLICY "Users can view branch audit logs"
  ON audit_logs FOR SELECT
  USING (
    branch_id IS NULL
    OR auth_user_has_branch(branch_id)
  );

-- Anyone authenticated can insert audit logs (for their own actions)
CREATE POLICY "Authenticated users can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- SETTINGS
-- ============================================================================

-- Super admin can view all settings
CREATE POLICY "Super admin can view all settings"
  ON settings FOR SELECT
  USING (auth_is_super_admin());

-- Users can view global and their branch settings
CREATE POLICY "Users can view relevant settings"
  ON settings FOR SELECT
  USING (
    branch_id IS NULL
    OR auth_user_has_branch(branch_id)
  );

-- Super admin can manage all settings
CREATE POLICY "Super admin can manage all settings"
  ON settings FOR ALL
  USING (auth_is_super_admin())
  WITH CHECK (auth_is_super_admin());

-- Branch admin can manage their branch settings
CREATE POLICY "Branch admin can manage branch settings"
  ON settings FOR ALL
  USING (
    branch_id IS NOT NULL
    AND auth_user_has_branch(branch_id)
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin'))
  )
  WITH CHECK (
    branch_id IS NOT NULL
    AND auth_user_has_branch(branch_id)
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'branch_admin'))
  );




