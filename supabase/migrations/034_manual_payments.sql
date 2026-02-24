-- Add manual payment instructions field to events for Pilot Phase MVP
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
