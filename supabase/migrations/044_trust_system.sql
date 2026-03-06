-- Create event_reviews table
CREATE TABLE event_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add review_sent flag to bookings to prevent spam/duplicate emails
ALTER TABLE bookings ADD COLUMN review_sent BOOLEAN DEFAULT FALSE;

-- Create notifications for low ratings (Admin oversight)
CREATE OR REPLACE FUNCTION notify_low_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating < 3 THEN
        INSERT INTO notifications (user_id, type, title, content)
        SELECT 
            e.creator_user_id, 
            'admin_warning', 
            'Low Rating Received', 
            'An attendee rated your event "' || e.title || '" with ' || NEW.rating || ' stars.'
        FROM events e
        WHERE e.id = NEW.event_id;
        
        -- Also notify system admin if a generic admin table exists, 
        -- otherwise we'll rely on the host notification for now.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_low_rating
AFTER INSERT ON event_reviews
FOR EACH ROW
EXECUTE FUNCTION notify_low_rating();

-- RLS Policies
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reviews" ON event_reviews
FOR SELECT USING (true);

CREATE POLICY "Guests can create reviews for attended events" ON event_reviews
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = event_reviews.booking_id
        AND bookings.user_id = auth.uid()
        AND bookings.checked_in = true
    )
);
