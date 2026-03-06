-- Add check-in fields to bookings table
ALTER TABLE bookings 
ADD COLUMN checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN checked_in_at TIMESTAMPTZ;

-- Ensure hosts can update their own event's bookings' check-in status
-- (Assuming hosts already have update access to bookings for status management, 
-- but explicitly allowing these new fields if needed)
CREATE POLICY "Hosts can check-in guests" ON bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.creator_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.creator_user_id = auth.uid()
  )
);
