-- 017_messaging_setup.sql

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id)
);

-- Ensure messages table exists (in case it was lost or never created)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add conversation_id to messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Make booking_id nullable if it's not already
ALTER TABLE messages 
ALTER COLUMN booking_id DROP NOT NULL;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" 
ON conversations FOR SELECT 
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Update messages policies to allow access via conversation_id
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" 
ON messages FOR SELECT 
USING (
    auth.uid() = sender_user_id OR 
    EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    ) OR
    -- Keep existing booking logic
    (booking_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.id = messages.booking_id
        AND (b.user_id = auth.uid() OR 
             EXISTS (SELECT 1 FROM events e WHERE e.id = b.event_id AND e.creator_user_id = auth.uid())
        )
    ))
);

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations" 
ON messages FOR INSERT 
WITH CHECK (
    auth.uid() = sender_user_id AND (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = conversation_id 
            AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        ) OR
        (booking_id IS NOT NULL)
    )
);
