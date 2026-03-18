-- Migration: Harden Notification RLS
-- Restrict INSERT so only the service role (from server actions) can create notifications.

-- 1. Drop existing insert policy if it exists (usually from 022_notifications.sql)
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- 2. Create restricted insert policy
-- Using "FOR INSERT TO service_role" is the cleanest way in Supabase to restrict to admin client.
-- However, sometimes it's safer to just NOT have an insert policy for 'authenticated', which defaults to deny.
-- We'll explicitly allow service_role if we want to be verbose, but by default, 
-- if no policy allows it for a role, it's denied.

-- Let's ensure service_role can do everything (usually true by default, but let's be explicit for security audits)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- If we want to allow only service role to insert:
CREATE POLICY "Service role can insert notifications" 
ON public.notifications 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Users should still be able to SELECT and UPDATE (is_read) their own notifications
-- These should already exist in 022, but let's ensure they are correct:
-- (Check 022_notifications.sql if you need to reconcile)
