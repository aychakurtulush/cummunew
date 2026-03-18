-- 057_fix_reports_permissions.sql

-- Explicitly grant permissions to common roles if they were missed
GRANT ALL ON TABLE reports TO authenticated;
GRANT ALL ON TABLE reports TO service_role;

-- Ensure RLS is active and correct
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Ensure users can create their own reports
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" 
ON reports FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Ensure users can view their own reports
DROP POLICY IF EXISTS "Reporters can view own reports" ON reports;
CREATE POLICY "Reporters can view own reports" 
ON reports FOR SELECT 
TO authenticated
USING (auth.uid() = reporter_id);
