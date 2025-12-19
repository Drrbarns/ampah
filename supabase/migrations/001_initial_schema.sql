-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Branches table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles (user metadata)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'branch_admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Branch assignments (many-to-many)
CREATE TABLE user_branch_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

-- Services catalog (per branch)
CREATE TABLE services_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('FLAT', 'PER_DAY', 'MANUAL')) DEFAULT 'FLAT',
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deceased cases (main record)
CREATE TABLE deceased_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  tag_no TEXT NOT NULL UNIQUE,
  name_of_deceased TEXT NOT NULL,
  age INTEGER CHECK (age >= 0 AND age <= 200),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other/Unknown')) DEFAULT 'Other/Unknown',
  place TEXT,
  admission_date DATE NOT NULL,
  admission_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Normal', 'VIP')) DEFAULT 'Normal',
  status TEXT NOT NULL CHECK (status IN ('IN_CUSTODY', 'DISCHARGED', 'CANCELLED', 'ARCHIVED')) DEFAULT 'IN_CUSTODY',
  discharge_date DATE,
  storage_days INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN discharge_date IS NOT NULL THEN GREATEST(0, (discharge_date - admission_date)::INTEGER)
      ELSE GREATEST(0, (CURRENT_DATE - admission_date)::INTEGER)
    END
  ) STORED,
  relative_name TEXT NOT NULL,
  relative_contact TEXT NOT NULL,
  relative_contact_secondary TEXT,
  notes TEXT,
  -- Receipt numbers
  embalming_receipt_no TEXT,
  coldroom_receipt_no TEXT,
  discharge_receipt_no TEXT,
  -- Financial fields (maintained via triggers/functions)
  embalming_fee NUMERIC(12,2) DEFAULT 0,
  coldroom_fee NUMERIC(12,2) DEFAULT 0,
  storage_fee NUMERIC(12,2) DEFAULT 0,
  total_bill NUMERIC(12,2) DEFAULT 0,
  total_paid NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Case charges (line items)
CREATE TABLE case_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES deceased_cases(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services_catalog(id),
  description TEXT NOT NULL,
  quantity NUMERIC(12,2) DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  charge_type TEXT NOT NULL CHECK (charge_type IN ('EMBALMING', 'COLDROOM', 'STORAGE', 'OTHER')),
  applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES deceased_cases(id) ON DELETE RESTRICT,
  paid_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  method TEXT NOT NULL CHECK (method IN ('CASH', 'MOMO', 'CARD', 'BANK')) DEFAULT 'CASH',
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  allocation TEXT NOT NULL CHECK (allocation IN ('EMBALMING', 'COLDROOM', 'STORAGE', 'GENERAL')) DEFAULT 'GENERAL',
  receipt_no TEXT NOT NULL,
  received_by UUID NOT NULL REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt sequences (per branch, per type)
CREATE TABLE receipt_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  receipt_type TEXT NOT NULL CHECK (receipt_type IN ('PAYMENT', 'DISCHARGE', 'EMBALMING', 'COLDROOM')),
  prefix TEXT NOT NULL,
  next_number INTEGER NOT NULL DEFAULT 1,
  UNIQUE(branch_id, receipt_type)
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings (per branch + global)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, key)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Branches
CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_branches_is_active ON branches(is_active);

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- User branch assignments
CREATE INDEX idx_user_branch_assignments_user_id ON user_branch_assignments(user_id);
CREATE INDEX idx_user_branch_assignments_branch_id ON user_branch_assignments(branch_id);

-- Services catalog
CREATE INDEX idx_services_catalog_branch_id ON services_catalog(branch_id);
CREATE INDEX idx_services_catalog_is_active ON services_catalog(is_active);

-- Deceased cases
CREATE UNIQUE INDEX idx_deceased_cases_tag_no ON deceased_cases(tag_no);
CREATE INDEX idx_deceased_cases_branch_id ON deceased_cases(branch_id);
CREATE INDEX idx_deceased_cases_status ON deceased_cases(status);
CREATE INDEX idx_deceased_cases_admission_date ON deceased_cases(admission_date);
CREATE INDEX idx_deceased_cases_discharge_date ON deceased_cases(discharge_date);
CREATE INDEX idx_deceased_cases_place ON deceased_cases(place);
CREATE INDEX idx_deceased_cases_type ON deceased_cases(type);
CREATE INDEX idx_deceased_cases_gender ON deceased_cases(gender);
-- Full-text search on name (trigram)
CREATE INDEX idx_deceased_cases_name_trgm ON deceased_cases USING gin(name_of_deceased gin_trgm_ops);
-- Composite index for common queries
CREATE INDEX idx_deceased_cases_branch_status ON deceased_cases(branch_id, status);

-- Case charges
CREATE INDEX idx_case_charges_case_id ON case_charges(case_id);
CREATE INDEX idx_case_charges_branch_id ON case_charges(branch_id);
CREATE INDEX idx_case_charges_charge_type ON case_charges(charge_type);

-- Payments
CREATE INDEX idx_payments_case_id ON payments(case_id);
CREATE INDEX idx_payments_branch_id ON payments(branch_id);
CREATE INDEX idx_payments_paid_on ON payments(paid_on);
CREATE INDEX idx_payments_receipt_no ON payments(receipt_no);
CREATE UNIQUE INDEX idx_payments_receipt_no_unique ON payments(branch_id, receipt_no);

-- Receipt sequences
CREATE INDEX idx_receipt_sequences_branch_type ON receipt_sequences(branch_id, receipt_type);

-- Audit logs
CREATE INDEX idx_audit_logs_branch_id ON audit_logs(branch_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION auth_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to a branch
CREATE OR REPLACE FUNCTION auth_user_has_branch(branch_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin has access to all branches
  IF auth_is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Check if user is assigned to the branch
  RETURN EXISTS (
    SELECT 1 FROM user_branch_assignments uba
    INNER JOIN profiles p ON p.id = uba.user_id
    WHERE uba.user_id = auth.uid()
    AND uba.branch_id = branch_id_param
    AND p.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate receipt number (transaction-safe)
CREATE OR REPLACE FUNCTION generate_receipt_number(
  branch_id_param UUID,
  receipt_type_param TEXT
)
RETURNS TEXT AS $$
DECLARE
  receipt_prefix TEXT;
  receipt_number INTEGER;
  receipt_no TEXT;
BEGIN
  -- Get or create receipt sequence
  INSERT INTO receipt_sequences (branch_id, receipt_type, prefix, next_number)
  VALUES (
    branch_id_param,
    receipt_type_param,
    CASE receipt_type_param
      WHEN 'PAYMENT' THEN 'ADM-PAY-'
      WHEN 'DISCHARGE' THEN 'ADM-DIS-'
      WHEN 'EMBALMING' THEN 'ADM-EMB-'
      WHEN 'COLDROOM' THEN 'ADM-COL-'
      ELSE 'ADM-'
    END,
    1
  )
  ON CONFLICT (branch_id, receipt_type)
  DO UPDATE SET next_number = receipt_sequences.next_number + 1
  RETURNING prefix, next_number INTO receipt_prefix, receipt_number;
  
  -- Format receipt number: PREFIX + zero-padded number (6 digits)
  receipt_no := receipt_prefix || LPAD(receipt_number::TEXT, 6, '0');
  
  RETURN receipt_no;
END;
$$ LANGUAGE plpgsql;

-- Function to update case financial totals
CREATE OR REPLACE FUNCTION update_case_financials(case_id_param UUID)
RETURNS void AS $$
DECLARE
  case_branch_id UUID;
  v_embalming_fee NUMERIC(12,2);
  v_coldroom_fee NUMERIC(12,2);
  v_storage_fee NUMERIC(12,2);
  v_total_bill NUMERIC(12,2);
  v_total_paid NUMERIC(12,2);
  v_balance NUMERIC(12,2);
BEGIN
  -- Get branch_id
  SELECT branch_id INTO case_branch_id FROM deceased_cases WHERE id = case_id_param;
  
  -- Calculate fees from charges
  SELECT 
    COALESCE(SUM(CASE WHEN charge_type = 'EMBALMING' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN charge_type = 'COLDROOM' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN charge_type = 'STORAGE' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0)
  INTO v_embalming_fee, v_coldroom_fee, v_storage_fee, v_total_bill
  FROM case_charges
  WHERE case_id = case_id_param;
  
  -- Calculate total paid
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_paid
  FROM payments
  WHERE case_id = case_id_param;
  
  -- Calculate balance
  v_balance := v_total_bill - v_total_paid;
  
  -- Update case
  UPDATE deceased_cases
  SET 
    embalming_fee = v_embalming_fee,
    coldroom_fee = v_coldroom_fee,
    storage_fee = v_storage_fee,
    total_bill = v_total_bill,
    total_paid = v_total_paid,
    balance = v_balance,
    updated_at = NOW()
  WHERE id = case_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_catalog_updated_at BEFORE UPDATE ON services_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deceased_cases_updated_at BEFORE UPDATE ON deceased_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update case financials when charges change
CREATE TRIGGER update_case_financials_on_charge_change
  AFTER INSERT OR UPDATE OR DELETE ON case_charges
  FOR EACH ROW EXECUTE FUNCTION update_case_financials(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.case_id
      ELSE NEW.case_id
    END
  );

-- Auto-update case financials when payments change
CREATE TRIGGER update_case_financials_on_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_case_financials(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.case_id
      ELSE NEW.case_id
    END
  );

-- Fix the trigger functions (they need to call the function, not be it)
DROP TRIGGER IF EXISTS update_case_financials_on_charge_change ON case_charges;
DROP TRIGGER IF EXISTS update_case_financials_on_payment_change ON payments;

CREATE OR REPLACE FUNCTION trigger_update_case_financials()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_case_financials(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.case_id ELSE NEW.case_id END
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_case_financials_on_charge_change
  AFTER INSERT OR UPDATE OR DELETE ON case_charges
  FOR EACH ROW EXECUTE FUNCTION trigger_update_case_financials();

CREATE TRIGGER update_case_financials_on_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_update_case_financials();

