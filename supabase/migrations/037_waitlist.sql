-- 037_waitlist.sql
-- Create the waitlist system for sold-out events

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ, -- Optional: track when they were emailed about a spot
    UNIQUE(event_id, user_id) -- A user can only be on the waitlist once per event
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own waitlist entries"
    ON waitlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waitlist entries"
    ON waitlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waitlist entries"
    ON waitlist FOR DELETE
    USING (auth.uid() = user_id);

-- Host policies: Hosts need to see who is on the waitlist for their events
CREATE POLICY "Hosts can view waitlist for their events"
    ON waitlist FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM events 
        WHERE events.id = waitlist.event_id 
        AND events.creator_user_id = auth.uid()
    ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_event_id ON waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON waitlist(user_id);
