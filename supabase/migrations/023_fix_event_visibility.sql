-- Enable RLS on events table (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 1. Policy for Public View (Approved events only)
CREATE POLICY "Public can view approved events" ON events
    FOR SELECT
    USING (status = 'approved');

-- 2. Policy for Creators (View own events, including drafts)
CREATE POLICY "Creators can view their own events" ON events
    FOR SELECT
    USING (auth.uid() = creator_user_id);

-- 3. Policy for Updates (Hosts can update own events)
CREATE POLICY "Hosts can update their own events" ON events
    FOR UPDATE
    USING (auth.uid() = creator_user_id)
    WITH CHECK (auth.uid() = creator_user_id);

-- Note: DELETE policy already exists in 012_allow_event_deletion.sql
