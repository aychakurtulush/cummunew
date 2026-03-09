-- 053_add_locale.sql
-- Add preferred locale column to profiles for bilingual email support

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT 'en' CHECK (preferred_locale IN ('en', 'de'));
