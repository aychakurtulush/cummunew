-- Add Mollie Connect OAuth fields to profile
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mollie_organization_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mollie_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mollie_refresh_token TEXT;
