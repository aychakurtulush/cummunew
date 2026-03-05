-- 040_enhance_profiles.sql
-- Add avatar_url and social_links to profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Ensure hosts can update their own profile fields
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);
