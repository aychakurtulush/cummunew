-- Create a public bucket for studio images
insert into storage.buckets (id, name, public)
values ('studio-images', 'studio-images', true)
on conflict (id) do nothing;

-- Set up RLS for the bucket
-- 1. Allow public access to read images
DROP POLICY IF EXISTS "Studio Images Public Access" ON storage.objects;
create policy "Studio Images Public Access"
on storage.objects for select
using ( bucket_id = 'studio-images' );

-- 2. Allow authenticated users to upload images
DROP POLICY IF EXISTS "Studio Images Upload" ON storage.objects;
create policy "Studio Images Upload"
on storage.objects for insert
with check (
  bucket_id = 'studio-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Allow owners to update/delete their images
DROP POLICY IF EXISTS "Studio Images Update" ON storage.objects;
create policy "Studio Images Update"
on storage.objects for update
using ( bucket_id = 'studio-images' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Studio Images Delete" ON storage.objects;
create policy "Studio Images Delete"
on storage.objects for delete
using ( bucket_id = 'studio-images' AND auth.uid() = owner );
