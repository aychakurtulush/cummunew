-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own bookings" 
    ON bookings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
    ON bookings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can view bookings for their events" 
    ON bookings FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = bookings.event_id 
            AND events.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can update bookings for their events" 
    ON bookings FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = bookings.event_id 
            AND events.host_id = auth.uid()
        )
    );
