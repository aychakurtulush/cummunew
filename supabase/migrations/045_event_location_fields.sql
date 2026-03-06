-- 045_event_location_fields.sql

-- Add location name and address for custom venues (parks, cafes, etc.)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Update existing events to have a default location name if they are studios
-- (Optional, but helps with data consistency)
UPDATE events
SET location_name = (SELECT name FROM studios WHERE studios.id = events.studio_id)
WHERE studio_id IS NOT NULL AND location_name IS NULL;
