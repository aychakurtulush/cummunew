-- 051_add_terms_acceptance.sql
-- Add terms_accepted_at to profiles and update the new user trigger

-- 1. Add column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- 2. Update the handle_new_user function to record acceptance from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    role, 
    terms_accepted_at
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    'participant',
    CASE 
      WHEN NEW.raw_user_meta_data->>'terms_accepted_at' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMPTZ 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
