-- 018_payments_setup.sql

-- Add Stripe Account ID to Host Profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add Stripe Payment Intent and Status to Bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add a check constraint to ensure payment_status is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_payment_status'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT valid_payment_status
        CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));
    END IF;
END $$;
