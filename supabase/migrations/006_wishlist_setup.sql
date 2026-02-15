-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wishlist" 
    ON wishlist FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
    ON wishlist FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
    ON wishlist FOR DELETE 
    USING (auth.uid() = user_id);
