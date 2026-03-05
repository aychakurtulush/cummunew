-- 038_discovery_indexes.sql
-- Add indexes to improve search and filter performance

CREATE INDEX IF NOT EXISTS idx_events_price ON events(price);

-- Optionally add an extension for trigram search if not already enabled, 
-- but ilike with indexes on small datasets is fine for now.
-- For title/description search to be truly fast on larger sets, we'd use pg_trgm.
