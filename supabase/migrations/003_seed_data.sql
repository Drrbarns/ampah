-- ============================================================================
-- SEED DATA
-- ============================================================================
-- This seed script should be run after creating a super admin user via Supabase Auth
-- Update the placeholder UUIDs with actual user IDs from your Supabase Auth

-- Example: Create branches
INSERT INTO branches (id, name, code, address, phone, is_active)
VALUES
  (gen_random_uuid(), 'Main Branch - Accra', 'ADM-001', '123 Main Street, Accra', '+233-24-123-4567', true),
  (gen_random_uuid(), 'Branch 2 - Kumasi', 'ADM-002', '456 Oak Avenue, Kumasi', '+233-24-234-5678', true)
ON CONFLICT (code) DO NOTHING;

-- Note: To create a super admin:
-- 1. Create user via Supabase Auth (email/password or magic link)
-- 2. Get the user ID from auth.users
-- 3. Insert into profiles with role='super_admin':
--
-- INSERT INTO profiles (id, full_name, phone, role, is_active)
-- VALUES (
--   'USER_UUID_HERE', -- Replace with actual auth.users.id
--   'Super Admin',
--   '+233-24-000-0000',
--   'super_admin',
--   true
-- );
--
-- 4. Assign super admin to all branches:
--
-- INSERT INTO user_branch_assignments (user_id, branch_id, is_primary)
-- SELECT 'USER_UUID_HERE', id, true FROM branches;

-- Example services for each branch (update branch IDs after creating branches)
DO $$
DECLARE
  branch1_id UUID;
  branch2_id UUID;
BEGIN
  -- Get branch IDs
  SELECT id INTO branch1_id FROM branches WHERE code = 'ADM-001' LIMIT 1;
  SELECT id INTO branch2_id FROM branches WHERE code = 'ADM-002' LIMIT 1;

  -- Insert services for branch 1
  IF branch1_id IS NOT NULL THEN
    INSERT INTO services_catalog (branch_id, name, pricing_model, unit_price, is_active)
    VALUES
      (branch1_id, 'Embalming Service', 'FLAT', 500.00, true),
      (branch1_id, 'Coldroom Daily', 'PER_DAY', 50.00, true),
      (branch1_id, 'Storage Fee', 'PER_DAY', 30.00, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert services for branch 2
  IF branch2_id IS NOT NULL THEN
    INSERT INTO services_catalog (branch_id, name, pricing_model, unit_price, is_active)
    VALUES
      (branch2_id, 'Embalming Service', 'FLAT', 500.00, true),
      (branch2_id, 'Coldroom Daily', 'PER_DAY', 50.00, true),
      (branch2_id, 'Storage Fee', 'PER_DAY', 30.00, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Initialize receipt sequences for branches
DO $$
DECLARE
  branch1_id UUID;
  branch2_id UUID;
BEGIN
  SELECT id INTO branch1_id FROM branches WHERE code = 'ADM-001' LIMIT 1;
  SELECT id INTO branch2_id FROM branches WHERE code = 'ADM-002' LIMIT 1;

  IF branch1_id IS NOT NULL THEN
    INSERT INTO receipt_sequences (branch_id, receipt_type, prefix, next_number)
    VALUES
      (branch1_id, 'PAYMENT', 'ADM-PAY-', 1),
      (branch1_id, 'DISCHARGE', 'ADM-DIS-', 1),
      (branch1_id, 'EMBALMING', 'ADM-EMB-', 1),
      (branch1_id, 'COLDROOM', 'ADM-COL-', 1)
    ON CONFLICT (branch_id, receipt_type) DO NOTHING;
  END IF;

  IF branch2_id IS NOT NULL THEN
    INSERT INTO receipt_sequences (branch_id, receipt_type, prefix, next_number)
    VALUES
      (branch2_id, 'PAYMENT', 'ADM-PAY-', 1),
      (branch2_id, 'DISCHARGE', 'ADM-DIS-', 1),
      (branch2_id, 'EMBALMING', 'ADM-EMB-', 1),
      (branch2_id, 'COLDROOM', 'ADM-COL-', 1)
    ON CONFLICT (branch_id, receipt_type) DO NOTHING;
  END IF;
END $$;

-- Global settings
INSERT INTO settings (branch_id, key, value)
VALUES
  (NULL, 'storage_count_admission_day', '{"value": true}'),
  (NULL, 'allow_discharge_with_balance', '{"value": false}'),
  (NULL, 'default_storage_rate', '{"value": 30.00}'),
  (NULL, 'default_coldroom_rate', '{"value": 50.00}'),
  (NULL, 'default_embalming_fee', '{"value": 500.00}')
ON CONFLICT (branch_id, key) DO NOTHING;

