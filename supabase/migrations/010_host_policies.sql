-- Add Host Visibility Policy
DROP POLICY IF EXISTS "Hosts can view bookings for their events" ON bookings;
CREATE POLICY "Hosts can view bookings for their events" ON bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.creator_user_id = auth.uid()
  )
);

-- Add Host Update Policy (for approving/rejecting)
DROP POLICY IF EXISTS "Hosts can update bookings for their events" ON bookings;
CREATE POLICY "Hosts can update bookings for their events" ON bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.creator_user_id = auth.uid()
  )
);
