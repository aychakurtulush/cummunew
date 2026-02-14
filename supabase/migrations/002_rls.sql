-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles
-- Everyone can read profiles (needed for host info)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile (handled by trigger, but good to have)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Studios
-- Everyone can view studios
CREATE POLICY "Studios are viewable by everyone" ON studios
  FOR SELECT USING (true);

-- Users can create a studio
CREATE POLICY "Users can create studios" ON studios
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- Owners can update their studio
CREATE POLICY "Owners can update their studios" ON studios
  FOR UPDATE USING (auth.uid() = owner_user_id);

-- Events
-- Everyone can view 'approved' events
CREATE POLICY "Approved events are viewable by everyone" ON events
  FOR SELECT USING (status = 'approved');

-- Creators can view all their events (even draft/pending)
CREATE POLICY "Creators can view their own events" ON events
  FOR SELECT USING (auth.uid() = creator_user_id);

-- Hosts can insert events
CREATE POLICY "Hosts can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = creator_user_id);

-- Hosts can update their events
CREATE POLICY "Hosts can update their events" ON events
  FOR UPDATE USING (auth.uid() = creator_user_id);

-- Bookings
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Hosts can view bookings for their events
CREATE POLICY "Hosts can view bookings for their events" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = bookings.event_id
      AND events.creator_user_id = auth.uid()
    )
  );

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Hosts can update bookings (to confirm/decline)
CREATE POLICY "Hosts can update bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = bookings.event_id
      AND events.creator_user_id = auth.uid()
    )
  );

-- Messages
-- Participants in the booking can view/send messages
CREATE POLICY "Users can view messages for their bookings" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = messages.booking_id
      AND (bookings.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.creator_user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can insert messages for their bookings" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_user_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND (bookings.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.creator_user_id = auth.uid()
      ))
    )
  );
