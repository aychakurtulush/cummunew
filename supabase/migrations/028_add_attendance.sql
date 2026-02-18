-- Add attended column to bookings table
ALTER TABLE bookings 
ADD COLUMN attended BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow hosts to update attendance
CREATE POLICY "Hosts can update attendance for their events"
ON bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.creator_user_id = auth.uid()
  )
);
