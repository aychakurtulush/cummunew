-- Migration: Create Feedback System
-- Description: Adds feedback_sent tracking to bookings and creates the event_feedback table.

-- 1. Add feedback_sent flag to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_sent BOOLEAN DEFAULT FALSE;

-- 2. Create feedbcks table
CREATE TABLE IF NOT EXISTS event_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent multiple feedbacks from the same user for the same event
    UNIQUE(event_id, guest_id)
);

-- Enable RLS
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can read feedback
CREATE POLICY "Feedback is viewable by everyone." 
ON event_feedback FOR SELECT 
USING (true);

-- Authenticated guests can create their own feedback
CREATE POLICY "Authenticated users can insert feedback" 
ON event_feedback FOR INSERT 
WITH CHECK (auth.uid() = guest_id);

-- Guests can update their own feedback
CREATE POLICY "Users can update own feedback" 
ON event_feedback FOR UPDATE 
USING (auth.uid() = guest_id);

-- Guests can delete their own feedback
CREATE POLICY "Users can delete own feedback" 
ON event_feedback FOR DELETE 
USING (auth.uid() = guest_id);
