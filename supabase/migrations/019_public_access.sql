-- 019_public_access.sql
-- Allow public to view events

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view events" ON events;
CREATE POLICY "Public can view events" 
ON events FOR SELECT 
TO public 
USING (true);

-- Ensure studios is also definitely public (redundant but safe)
DROP POLICY IF EXISTS "Public can view studios" ON studios;
CREATE POLICY "Public can view studios" 
ON studios FOR SELECT 
TO public 
USING (true);
