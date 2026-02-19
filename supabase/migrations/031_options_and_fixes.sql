-- 031_options_and_fixes.sql

-- 1. Enhance Events Table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS seating_type TEXT CHECK (seating_type IN ('standing', 'seated', 'mixed')) DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS materials_provided BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_guided BOOLEAN DEFAULT TRUE;

-- 2. Enhance Studios Table with features
ALTER TABLE studios
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- 3. (Optional) Indexes for new columns if filtering becomes heavy
-- CREATE INDEX IF NOT EXISTS idx_events_seating ON events(seating_type);
