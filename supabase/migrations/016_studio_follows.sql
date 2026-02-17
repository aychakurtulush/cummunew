-- 016_studio_follows.sql
-- Create studio_follows table if it doesn't verify existence
-- Note: This is designed to be safe to run multiple times using IF NOT EXISTS

CREATE TABLE IF NOT EXISTS studio_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, studio_id)
);

-- Enable RLS
ALTER TABLE studio_follows ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can view their own follows
DROP POLICY IF EXISTS "Users can view own follows" ON studio_follows;
CREATE POLICY "Users can view own follows" ON studio_follows FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own follows
DROP POLICY IF EXISTS "Users can create own follows" ON studio_follows;
CREATE POLICY "Users can create own follows" ON studio_follows FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own follows
DROP POLICY IF EXISTS "Users can delete own follows" ON studio_follows;
CREATE POLICY "Users can delete own follows" ON studio_follows FOR DELETE USING (auth.uid() = user_id);
