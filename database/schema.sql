-- Pawn Shop Database Schema
-- Thiết kế cho hệ thống cầm đồ với 2 vai trò: User và Shop

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'shop', 'admin');

-- Asset status enum  
CREATE TYPE asset_status AS ENUM ('pending', 'appraised', 'collateralized', 'liquidated', 'returned');

-- Loan status enum
CREATE TYPE loan_status AS ENUM ('active', 'paid', 'defaulted', 'liquidated');

-- Users table (cả user và shop đều dùng chung)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Profile fields
    full_name VARCHAR(255),
    phone VARCHAR(20),
    wallet_address VARCHAR(42),
    
    -- Shop-specific fields (null for regular users)
    shop_name VARCHAR(255),
    shop_license VARCHAR(100),
    shop_address TEXT,
    
    -- Settings
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Assets table (tài sản được cầm)
CREATE TABLE assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appraiser_id UUID REFERENCES users(id) ON DELETE SET NULL, -- shop đánh giá
    
    -- Asset details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- watch, jewelry, electronics, etc.
    serial_number VARCHAR(255),
    
    -- AR/NFT data
    nft_token_id BIGINT,
    nft_contract_address VARCHAR(42),
    image_url TEXT,
    ar_metadata JSONB, -- AR scan data, confidence, etc.
    
    -- Valuation
    estimated_value DECIMAL(15,2), -- user's estimate
    appraised_value DECIMAL(15,2), -- shop's appraisal
    market_value DECIMAL(15,2), -- current market value
    
    -- Status
    status asset_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans table (hợp đồng vay)
CREATE TABLE loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lender_id UUID REFERENCES users(id) ON DELETE CASCADE, -- shop
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    
    -- Loan terms
    principal_amount DECIMAL(15,2) NOT NULL, -- số tiền vay
    interest_rate DECIMAL(5,4) NOT NULL, -- lãi suất (% per month)
    loan_duration_days INTEGER NOT NULL DEFAULT 30, -- thời hạn vay (ngày)
    
    -- Calculated fields
    interest_amount DECIMAL(15,2) NOT NULL, -- tiền lãi
    total_amount DECIMAL(15,2) NOT NULL, -- tổng phải trả
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status loan_status DEFAULT 'active',
    
    -- Blockchain data
    smart_contract_address VARCHAR(42),
    transaction_hash VARCHAR(66),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (lịch sử thanh toán)
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'partial', 'full', 'interest_only'
    
    -- Blockchain data
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appraisals table (lịch sử định giá)
CREATE TABLE appraisals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    appraiser_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Appraisal details
    appraised_value DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00-1.00
    notes TEXT,
    
    -- Supporting documents
    images JSONB, -- array of image URLs
    documents JSONB, -- certificates, receipts, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'loan_due', 'payment_received', 'asset_appraised', etc.
    
    -- Related entities
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_nft_token ON assets(nft_token_id);

CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_lender ON loans(lender_id);
CREATE INDEX idx_loans_asset ON loans(asset_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(due_date);

CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Assets policies
CREATE POLICY "Users can view own assets" ON assets
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Shops can view assets for appraisal" ON assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'shop'
        )
    );

CREATE POLICY "Users can create assets" ON assets
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Loans policies  
CREATE POLICY "Borrowers can view own loans" ON loans
    FOR SELECT USING (auth.uid() = borrower_id);

CREATE POLICY "Lenders can view their loans" ON loans
    FOR SELECT USING (auth.uid() = lender_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for calculated fields

-- Calculate health factor for a user's portfolio
CREATE OR REPLACE FUNCTION calculate_health_factor(user_uuid UUID)
RETURNS DECIMAL(10,4) AS $$
DECLARE
    total_collateral DECIMAL(15,2) := 0;
    total_debt DECIMAL(15,2) := 0;
    health_factor DECIMAL(10,4);
BEGIN
    -- Sum up collateral value (appraised value of active loans)
    SELECT COALESCE(SUM(a.appraised_value), 0) INTO total_collateral
    FROM loans l
    JOIN assets a ON l.asset_id = a.id
    WHERE l.borrower_id = user_uuid AND l.status = 'active';
    
    -- Sum up total debt (outstanding loan amounts)
    SELECT COALESCE(SUM(l.total_amount), 0) INTO total_debt
    FROM loans l
    WHERE l.borrower_id = user_uuid AND l.status = 'active';
    
    -- Calculate health factor (collateral / debt)
    IF total_debt = 0 THEN
        RETURN 999.9999; -- No debt = perfect health
    ELSE
        health_factor := total_collateral / total_debt;
        RETURN LEAST(health_factor, 999.9999);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
