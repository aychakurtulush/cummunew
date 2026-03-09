-- 052_expand_features.sql
-- Add more detailed fields to events and studios

-- Add columns to events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS age_range TEXT;

-- Add space_rules to studios
ALTER TABLE studios
ADD COLUMN IF NOT EXISTS space_rules TEXT;

-- Note: We don't strictly need a new ENUM for categories yet as it's a TEXT field in the schema,
-- but adding a comment/check constraint could be useful in the future.
