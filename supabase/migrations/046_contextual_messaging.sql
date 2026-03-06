-- 046_contextual_messaging.sql

-- 1. Drop existing unique constraint that limits 1-to-1 open messaging
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS unique_participants;

-- 2. Add context fields
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS context_type TEXT CHECK (context_type IN ('event', 'studio', 'booking', 'inquiry'));
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS context_id UUID;

-- 3. Create a new unique constraint to ensure only ONE conversation per context per user pair
-- For example, user A and user B can only have ONE conversation specifically about Event C.
ALTER TABLE conversations ADD CONSTRAINT unique_contextual_conversation UNIQUE (participant1_id, participant2_id, context_type, context_id);

-- Optional: Create an index for faster lookups by context
CREATE INDEX IF NOT EXISTS idx_conversations_context ON conversations(context_type, context_id);
