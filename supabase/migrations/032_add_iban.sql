-- Add IBAN field to profiles for manual payouts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS iban TEXT;
