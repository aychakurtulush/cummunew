-- 1. Enable RLS (just in case)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 2. Add Missing DELETE Policy
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;
CREATE POLICY "Users can delete their own bookings" ON bookings 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Double check Permissions
GRANT DELETE ON bookings TO authenticated;
GRANT DELETE ON bookings TO service_role;
