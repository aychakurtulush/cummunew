-- Add avatar_url to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up RLS for avatars bucket
-- 1. Public read access
create policy "Public Access Avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 2. Authenticated upload
create policy "Authenticated Upload Avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 3. Owner update/delete
create policy "Owner Access Avatars"
on storage.objects for update
using ( bucket_id = 'avatars' AND auth.uid() = owner );

create policy "Owner Delete Avatars"
on storage.objects for delete
using ( bucket_id = 'avatars' AND auth.uid() = owner );
