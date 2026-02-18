-- 027_reports_system.sql

-- 1. Create 'reports' table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('event', 'studio', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Reporters can view their own reports
CREATE POLICY "Reporters can view own reports" 
ON reports FOR SELECT 
USING (auth.uid() = reporter_id);

-- Authenticated users can create reports
CREATE POLICY "Users can create reports" 
ON reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- 4. Trigger for updated_at
CREATE TRIGGER update_reports_updated_at 
BEFORE UPDATE ON reports 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
