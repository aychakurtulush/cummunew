-- 026_studio_crud_policies.sql

-- 1. Studio Owners can UPDATE their own studios
CREATE POLICY "Owners can update their studios"
ON studios FOR UPDATE
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- 2. Studio Owners can DELETE their own studios
CREATE POLICY "Owners can delete their studios"
ON studios FOR DELETE
USING (auth.uid() = owner_user_id);

-- 3. Requesters can DELETE their own inquiries (Cancel Request)
-- Note: 'Owners can delete inquiries' was added in 025.
CREATE POLICY "Requesters can delete own inquiries"
ON studio_inquiries FOR DELETE
USING (auth.uid() = requester_id);
