-- 039_reminder_flags.sql
-- Add flags to track if automated reminders have been sent

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Index for cron job performance
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_sent ON bookings(reminder_sent) WHERE reminder_sent = FALSE;
