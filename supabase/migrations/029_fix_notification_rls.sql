-- 029_fix_notification_rls.sql

-- Drop existing restricted policy
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

-- Create permissive insert policy
-- This allows any authenticated user to create a notification for any other user
-- Essential for "Guest -> Host" notification flow without Service Role
CREATE POLICY "Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
