-- 047_add_payment_instructions.sql

-- Add payment_instructions column to events table to support manual payments
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
