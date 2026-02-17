-- 020_studio_inquiries.sql

-- Create Enums
CREATE TYPE inquiry_status AS ENUM ('pending', 'approved', 'rejected');

-- Create Table
CREATE TABLE studio_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    message TEXT,
    status inquiry_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE studio_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Requester can view their own inquiries
CREATE POLICY "Requesters can view own inquiries"
ON studio_inquiries FOR SELECT
USING (auth.uid() = requester_id);

-- 2. Studio Owners can view inquiries for their studios
CREATE POLICY "Owners can view inquiries for their studios"
ON studio_inquiries FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM studios
        WHERE studios.id = studio_inquiries.studio_id
        AND studios.owner_user_id = auth.uid()
    )
);

-- 3. Authenticated users can create inquiries
CREATE POLICY "Users can create inquiries"
ON studio_inquiries FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- 4. Owners can update inquiries (Approve/Reject)
CREATE POLICY "Owners can update status"
ON studio_inquiries FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM studios
        WHERE studios.id = studio_inquiries.studio_id
        AND studios.owner_user_id = auth.uid()
    )
);

-- Indexes
CREATE INDEX idx_studio_inquiries_studio_id ON studio_inquiries(studio_id);
CREATE INDEX idx_studio_inquiries_requester_id ON studio_inquiries(requester_id);
CREATE INDEX idx_studio_inquiries_status ON studio_inquiries(status);

-- Grant Permissions
GRANT ALL ON TABLE studio_inquiries TO authenticated;
GRANT ALL ON TABLE studio_inquiries TO service_role;
