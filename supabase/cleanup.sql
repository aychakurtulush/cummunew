-- cleanup.sql
-- Deletes data safely, checking if tables exist first.

DO $$ 
BEGIN
    -- 1. Messages
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
        DELETE FROM public.messages;
    END IF;

    -- 2. Bookings
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
        DELETE FROM public.bookings;
    END IF;

    -- 3. Events
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events') THEN
        DELETE FROM public.events;
    END IF;

    -- 4. Studios
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'studios') THEN
        DELETE FROM public.studios;
    END IF;

    -- 5. Profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DELETE FROM public.profiles;
    END IF;
    
END $$;
