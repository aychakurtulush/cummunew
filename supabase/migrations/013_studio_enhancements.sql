-- 1. Enhance 'studios' table
ALTER TABLE studios 
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'archived'));

-- 2. Create 'studio_requests' table
CREATE TABLE IF NOT EXISTS studio_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The person requesting
    event_id UUID REFERENCES events(id) ON DELETE SET NULL, -- Optional link to an event draft
    message TEXT,
    requested_date DATE, -- Simplification for MVP
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE studio_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policies for studio_requests

-- Requester can view their own requests
CREATE POLICY "Requesters can view own requests" ON studio_requests
    FOR SELECT USING (auth.uid() = host_user_id);

-- Requester can insert requests
CREATE POLICY "Requesters can create requests" ON studio_requests
    FOR INSERT WITH CHECK (auth.uid() = host_user_id);

-- Studio Owners can view requests for their studios
CREATE POLICY "Studio Owners can view requests" ON studio_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM studios
            WHERE studios.id = studio_requests.studio_id
            AND studios.owner_user_id = auth.uid()
        )
    );

-- Studio Owners can update requests (to approve/reject)
CREATE POLICY "Studio Owners can update requests" ON studio_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM studios
            WHERE studios.id = studio_requests.studio_id
            AND studios.owner_user_id = auth.uid()
        )
    );

-- 5. Trigger for updated_at
CREATE TRIGGER update_studio_requests_updated_at 
    BEFORE UPDATE ON studio_requests 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
