-- Studio Feature Bundle (Tables + Storage + RLS)

-- 1. Create 'studios' table
CREATE TABLE IF NOT EXISTS studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    capacity INTEGER,
    price_per_hour DECIMAL(10, 2),
    amenities TEXT[],
    images TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create 'studio_requests' table
CREATE TABLE IF NOT EXISTS studio_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    message TEXT,
    requested_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policies for 'studios'
-- Everyone can view studios
DROP POLICY IF EXISTS "Studios are viewable by everyone" ON studios;
CREATE POLICY "Studios are viewable by everyone" ON studios FOR SELECT USING (true);
-- Auth users can create
DROP POLICY IF EXISTS "Users can create studios" ON studios;
CREATE POLICY "Users can create studios" ON studios FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
-- Owners can update
DROP POLICY IF EXISTS "Owners can update their studios" ON studios;
CREATE POLICY "Owners can update their studios" ON studios FOR UPDATE USING (auth.uid() = owner_user_id);
-- Owners can delete
DROP POLICY IF EXISTS "Owners can delete their studios" ON studios;
CREATE POLICY "Owners can delete their studios" ON studios FOR DELETE USING (auth.uid() = owner_user_id);

-- 5. Policies for 'studio_requests'
-- Requester can view own
DROP POLICY IF EXISTS "Requesters can view own requests" ON studio_requests;
CREATE POLICY "Requesters can view own requests" ON studio_requests FOR SELECT USING (auth.uid() = host_user_id);
-- Requester can insert
DROP POLICY IF EXISTS "Requesters can create requests" ON studio_requests;
CREATE POLICY "Requesters can create requests" ON studio_requests FOR INSERT WITH CHECK (auth.uid() = host_user_id);
-- Owners can view requests for their studios
DROP POLICY IF EXISTS "Studio Owners can view requests" ON studio_requests;
CREATE POLICY "Studio Owners can view requests" ON studio_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM studios WHERE studios.id = studio_requests.studio_id AND studios.owner_user_id = auth.uid())
);
-- Owners can update requests
DROP POLICY IF EXISTS "Studio Owners can update requests" ON studio_requests;
CREATE POLICY "Studio Owners can update requests" ON studio_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studios WHERE studios.id = studio_requests.studio_id AND studios.owner_user_id = auth.uid())
);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_studio_requests_updated_at ON studio_requests;
CREATE TRIGGER update_studio_requests_updated_at BEFORE UPDATE ON studio_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Storage Bucket setup
insert into storage.buckets (id, name, public) values ('studio-images', 'studio-images', true) on conflict (id) do nothing;

-- 8. Storage Policies
DROP POLICY IF EXISTS "Studio Images Public Access" ON storage.objects;
create policy "Studio Images Public Access" on storage.objects for select using ( bucket_id = 'studio-images' );

DROP POLICY IF EXISTS "Studio Images Upload" ON storage.objects;
create policy "Studio Images Upload" on storage.objects for insert with check ( bucket_id = 'studio-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Studio Images Update" ON storage.objects;
create policy "Studio Images Update" on storage.objects for update using ( bucket_id = 'studio-images' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Studio Images Delete" ON storage.objects;
create policy "Studio Images Delete" on storage.objects for delete using ( bucket_id = 'studio-images' AND auth.uid() = owner );
