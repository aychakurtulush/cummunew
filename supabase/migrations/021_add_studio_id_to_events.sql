-- 021_add_studio_id_to_events.sql

-- Add studio_id column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES studios(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_events_studio_id ON events(studio_id);
