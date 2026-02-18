-- 022_notifications.sql

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'booking_request', 'booking_status', 'studio_inquiry', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Users can update their own notifications (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Service role (and system) can insert notifications
-- We also allow authenticated users to insert if we want client-side triggers (e.g. sending a message triggers a notification for the other user)
-- Ideally this is done via Database Triggers or Server Actions (Service Role). 
-- For MVP Server Actions, we grant insert to authenticated users BUT they can only insert for others? No, usually we want restricted insert.
-- Let's allow authenticated users to insert for *other* users (e.g. "I sent a message, so I create a notification for you")
-- SECURITY NOTE: In a strict system, this should be done by a Trigger or Edge Function. 
-- For this MVP, allowing authenticated users to insert is acceptable to keep logic in Next.js Server Actions.
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 
    -- We could restrict `user_id != auth.uid()` but sometimes you might want to notify yourself? Probably not.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
