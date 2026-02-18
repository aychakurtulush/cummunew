-- 030_fix_notification_permissions.sql

-- Reset RLS policies for notifications to ensure they are correct

-- Enable RLS (just in case)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop any existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON notifications;
DROP POLICY IF EXISTS "Any authenticatd user can insert" ON notifications;

-- Create a fresh, permissive INSERT policy
-- This allows ANY logged-in user to insert rows (needed for guest->host booking notifications)
CREATE POLICY "Users can insert notifications" 
ON notifications
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Ensure SELECT/UPDATE policies exist for the owner (so they can read/mark read)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" 
ON notifications
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" 
ON notifications
FOR UPDATE 
USING (auth.uid() = user_id);

-- Explicitly grant permissions to the authenticated role
GRANT ALL ON TABLE notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;
