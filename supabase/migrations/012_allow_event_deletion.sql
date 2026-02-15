-- Enable DELETE for events table
-- This allows creators to delete their own events.
-- Because bookings has ON DELETE CASCADE (ref 007_bookings_setup.sql), deletion will cascade.

CREATE POLICY "Creators can delete their own events" ON events
    FOR DELETE
    USING (auth.uid() = creator_user_id);
