-- 026_studio_crud_policies.sql

-- Studio Update/Delete policies already exist in 013_studio_enhancements.sql
-- We only need to add the policy for Inquiries (studio_inquiries table)

-- 3. Requesters can DELETE their own inquiries (Cancel Request)
-- Note: 'Owners can delete inquiries' was added in 025.
create policy "Requesters can delete own inquiries"
on studio_inquiries for delete
using ( auth.uid() = requester_id );
