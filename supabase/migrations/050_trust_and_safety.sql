-- 050_trust_and_safety.sql
-- Implement penalty system and expand reports

-- 1. Add penalty fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_suspended_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. Expand reports system
-- Note: 'reports' table was created in 027_reports_system.sql
-- We add admin_notes and enforcement_level
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS enforcement_level TEXT CHECK (enforcement_level IN ('none', 'warning', 'suspension', 'ban'));

-- 3. Update RLS for profiles to prevent suspended/banned users from doing certain things
-- This is a complex change that might be better handled at the application level (Actions),
-- but we can add a check to the UPDATE policy.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id AND is_banned = FALSE);

-- 4. Update Event publishing RLS
-- Prevent banned users from creating events
DROP POLICY IF EXISTS "Hosts can create events" ON events;
CREATE POLICY "Hosts can create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() = creator_user_id AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND is_banned = FALSE 
        AND (is_suspended_until IS NULL OR is_suspended_until < NOW())
    )
  );
