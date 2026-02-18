-- Add notifications table to supabase_realtime publication
-- This enables the client-side subscription in NotificationBell to receive INSERT events
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
