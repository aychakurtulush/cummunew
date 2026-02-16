-- Fix RLS policies for 'studios' table
-- Ensure RLS is enabled
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

-- 1. INSERT: Allow authenticated users to create studios
DROP POLICY IF EXISTS "Users can create studios" ON studios;
CREATE POLICY "Users can create studios" ON studios
    FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- 2. SELECT: Allow everyone to view studios
DROP POLICY IF EXISTS "Studios are viewable by everyone" ON studios;
CREATE POLICY "Studios are viewable by everyone" ON studios
    FOR SELECT USING (true);

-- 3. UPDATE: Allow owners to update their studios
DROP POLICY IF EXISTS "Owners can update their studios" ON studios;
CREATE POLICY "Owners can update their studios" ON studios
    FOR UPDATE USING (auth.uid() = owner_user_id);

-- 4. DELETE: Allow owners to delete their studios
DROP POLICY IF EXISTS "Owners can delete their studios" ON studios;
CREATE POLICY "Owners can delete their studios" ON studios
    FOR DELETE USING (auth.uid() = owner_user_id);
