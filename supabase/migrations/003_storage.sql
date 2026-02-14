-- Create Buckets (if not exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for event-images
-- Public Read
CREATE POLICY "Event images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

-- Authenticated Upload
CREATE POLICY "Authenticated users can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Owner Update/Delete
CREATE POLICY "Users can update their own event images" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'event-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own event images" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-images' AND auth.uid() = owner);


-- Policies for avatars
-- Public Read
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated Upload
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Owner Update/Delete
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);
