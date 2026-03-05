-- 036_host_profiles.sql
-- Add social links and ensure RLS is public friendly for viewing profiles

-- 1. Add social_links column as JSONB for flexible link storage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Ensure Profiles are publicly readable
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

-- (Sanity check: Authenticated users can already UPDATE their own profiles based on 002_rls.sql)
