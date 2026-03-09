-- 055_add_city_to_profiles.sql
-- Add city column to profiles table for location display

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Update existing profiles to have a default city 'Amsterdam, NL' if they are hosts
UPDATE profiles SET city = 'Amsterdam, NL' WHERE role = 'host' AND city IS NULL;
