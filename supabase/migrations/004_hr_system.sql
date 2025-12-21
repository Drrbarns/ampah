-- HR Management System Tables
-- This migration adds comprehensive HR features

-- 1. Employee Extended Profiles
CREATE TABLE IF NOT EXISTS employee_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),
    
    -- Employment Details
    department VARCHAR(100),
    position VARCHAR(100),
    employment_type VARCHAR(50), -- Full-time, Part-time, Contract
    date_hired DATE NOT NULL,
    date_terminated DATE,
    employment_status VARCHAR(50) DEFAULT 'active', -- active, terminated, suspended
    
    -- Compensation
    base_salary DECIMAL(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'GHS',
    payment_frequency VARCHAR(20), -- monthly, bi-weekly, weekly
    
    -- Documents
    national_id VARCHAR(50),
    ssnit_number VARCHAR(50),
    tin_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_branch VARCHAR(100),
    
    -- System
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES profiles(id),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(50), -- present, absent, late, half-day
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- 4. Leave Management
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    days_per_year INTEGER,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payroll
CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, processed, paid
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    
    -- Earnings
    basic_salary DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) DEFAULT 0,
    bonuses DECIMAL(12, 2) DEFAULT 0,
    overtime DECIMAL(12, 2) DEFAULT 0,
    gross_pay DECIMAL(12, 2) NOT NULL,
    
    -- Deductions
    tax DECIMAL(12, 2) DEFAULT 0,
    ssnit DECIMAL(12, 2) DEFAULT 0,
    other_deductions DECIMAL(12, 2) DEFAULT 0,
    total_deductions DECIMAL(12, 2) DEFAULT 0,
    
    -- Net
    net_pay DECIMAL(12, 2) NOT NULL,
    
    -- Payment
    payment_method VARCHAR(50), -- bank_transfer, cash, cheque
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid
    paid_at TIMESTAMPTZ,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_date DATE,
    
    -- Ratings (1-5 scale)
    quality_of_work INTEGER CHECK (quality_of_work BETWEEN 1 AND 5),
    productivity INTEGER CHECK (productivity BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    teamwork INTEGER CHECK (teamwork BETWEEN 1 AND 5),
    punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
    overall_rating DECIMAL(3, 2),
    
    -- Comments
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,
    
    status VARCHAR(50) DEFAULT 'draft', -- draft, completed, acknowledged
    acknowledged_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Employee Documents
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- resume, contract, certificate, id_card, etc.
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 8. Training & Development
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trainer VARCHAR(255),
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    cost DECIMAL(12, 2),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'registered', -- registered, attended, completed, absent
    completion_date DATE,
    certificate_issued BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_profiles_employee_id ON employee_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_records_employee ON payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_period ON payroll_records(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);

-- Insert default leave types
INSERT INTO leave_types (name, description, days_per_year, is_paid, requires_approval) VALUES
('Annual Leave', 'Yearly vacation leave', 21, true, true),
('Sick Leave', 'Medical leave for illness', 14, true, true),
('Maternity Leave', 'Leave for childbirth', 90, true, true),
('Paternity Leave', 'Leave for new fathers', 7, true, true),
('Compassionate Leave', 'Leave for family emergencies', 5, true, true),
('Unpaid Leave', 'Leave without pay', 0, false, true)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

-- Super Admin can see all HR data
CREATE POLICY "Super admin full access to employee_profiles" ON employee_profiles FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to departments" ON departments FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to attendance" ON attendance FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to leave_types" ON leave_types FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to leave_requests" ON leave_requests FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to payroll_periods" ON payroll_periods FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to payroll_records" ON payroll_records FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to performance_reviews" ON performance_reviews FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to employee_documents" ON employee_documents FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to training_programs" ON training_programs FOR ALL USING (auth_is_super_admin());
CREATE POLICY "Super admin full access to training_attendance" ON training_attendance FOR ALL USING (auth_is_super_admin());

-- Employees can view their own data
CREATE POLICY "Employees can view own profile" ON employee_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Employees can view own attendance" ON attendance FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can view own leave requests" ON leave_requests FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can create leave requests" ON leave_requests FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Employees can view own payroll" ON payroll_records FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can view own reviews" ON performance_reviews FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can view own documents" ON employee_documents FOR SELECT USING (employee_id = auth.uid());

-- Everyone can view leave types
CREATE POLICY "Anyone can view leave types" ON leave_types FOR SELECT USING (is_active = true);

COMMENT ON TABLE employee_profiles IS 'Extended employee information beyond basic auth profiles';
COMMENT ON TABLE attendance IS 'Daily attendance tracking for all employees';
COMMENT ON TABLE leave_requests IS 'Employee leave/vacation requests and approvals';
COMMENT ON TABLE payroll_records IS 'Salary and payment records for employees';
COMMENT ON TABLE performance_reviews IS 'Employee performance evaluations';

