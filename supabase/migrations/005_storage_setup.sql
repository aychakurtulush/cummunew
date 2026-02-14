-- Create a public bucket for event images
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Set up RLS for the bucket
-- 1. Allow public access to read images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'event-images' );

-- 2. Allow authenticated users to upload images
create policy "Authenticated Upload"
on storage.objects for insert
with check (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Allow owners to update/delete their images (optional but good practice)
create policy "Owner Access"
on storage.objects for update
using ( bucket_id = 'event-images' AND auth.uid() = owner );

create policy "Owner Delete"
on storage.objects for delete
using ( bucket_id = 'event-images' AND auth.uid() = owner );
