-- 041_add_follows.sql
-- Create follows table for host-follower system

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, host_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see their own follows" 
ON follows FOR SELECT 
USING (auth.uid() = follower_id);

CREATE POLICY "Anyone can see follow counts" 
ON follows FOR SELECT 
USING (true);

CREATE POLICY "Users can follow/unfollow" 
ON follows FOR ALL 
USING (auth.uid() = follower_id);

-- Index for performance
CREATE INDEX idx_follows_host_id ON follows(host_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
