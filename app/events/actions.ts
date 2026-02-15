'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function bookEvent(formData: FormData) {
    const eventId = formData.get('eventId') as string
    console.log('[bookEvent] Request for event:', eventId);

    const supabase = await createClient()

    if (!supabase) {
        console.error('[bookEvent] Supabase client failed');
        return { error: "Demo Mode: Backend not configured" }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.log('[bookEvent] No user logged in');
        return { error: "Not authenticated" }
    }

    // Check if already booked
    const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('[bookEvent] Check error:', checkError);
    }

    if (existingBooking) {
        console.log('[bookEvent] Already booked');
        return { success: true, message: "Already booked" }
    }

    const { error } = await supabase
        .from('bookings')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'pending'
        })

    if (error) {
        console.error('[bookEvent] Insert error:', error);
        return { error: error.message }
    }

    console.log('[bookEvent] Booking successful');

    // --- Email Notification Start ---
    try {
        // Fetch event details for the email
        const { data: eventData } = await supabase
            .from('events')
            .select('title')
            .eq('id', eventId)
            .single();

        if (eventData && user.email) {
            // Dynamically import to avoid build issues if file missing (though we just created it)
            const { sendBookingNotification } = await import('@/lib/email');
            await sendBookingNotification(user.email, eventData.title, eventId);
        }
    } catch (emailError) {
        console.error('[bookEvent] Email failed (non-critical):', emailError);
        // Don't fail the booking if email fails
    }
    // --- Email Notification End ---

    revalidatePath('/bookings')
    revalidatePath(`/events/${eventId}`)
    return { success: true }
}

export async function toggleWishlist(eventId: string) {
    console.log('[toggleWishlist] Starting for event:', eventId);
    const supabase = await createClient()
    if (!supabase) {
        console.error('[toggleWishlist] Supabase client creation failed');
        return { error: "Not authenticated" }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('[toggleWishlist] No authenticated user found');
        return { error: "Not authenticated" }
    }

    console.log('[toggleWishlist] User found:', user.id);

    // Check if exists
    const { data: existing, error: fetchError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('[toggleWishlist] Error fetching existing state:', fetchError);
    }

    if (existing) {
        console.log('[toggleWishlist] Removing from wishlist:', existing.id);
        // Remove
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', existing.id)

        if (error) {
            console.error('[toggleWishlist] Delete failed:', error);
            return { error: error.message }
        }
    } else {
        console.log('[toggleWishlist] Adding to wishlist');
        // Add
        const { error } = await supabase
            .from('wishlist')
            .insert({
                user_id: user.id,
                event_id: eventId
            })

        if (error) {
            console.error('[toggleWishlist] Insert failed:', error);
            return { error: error.message }
        }
    }

    console.log('[toggleWishlist] Success. Revalidating paths.');
    revalidatePath('/')
    revalidatePath('/dashboard/saved')
    revalidatePath(`/events/${eventId}`)

    return { success: true, isLiked: !existing }
}

export async function cancelBooking(bookingId: string) {
    const supabase = await createClient()

    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Verify ownership
    const { data: booking } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('id', bookingId)
        .single()

    if (!booking || booking.user_id !== user.id) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

    if (error) {
        console.error('Cancel error:', error)
        return { error: error.message }
    }

    revalidatePath('/bookings')
    return { success: true }
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'declined') {
    const supabase = await createClient()

    if (!supabase) return { error: "Database connection failed" }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Verify host ownership (security check)
    // We need to check if the CURRENT user is the CREATOR of the event associated with this booking
    const { data: booking } = await supabase
        .from('bookings')
        .select(`
            id,
            event_id,
            events (
                creator_user_id
            )
        `)
        .eq('id', bookingId)
        .single()

    if (!booking) return { error: "Booking not found" }
    // @ts-ignore - Supabase types might be tricky with joins
    if (booking.events?.creator_user_id !== user.id) {
        return { error: "Unauthorized: You are not the host of this event" }
    }

    // Update status
    const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

    if (error) {
        console.error('Update booking error:', error)
        return { error: error.message }
    }

    revalidatePath('/host')
    revalidatePath('/bookings')
    return { success: true }
}

export async function approveEvent(eventId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    // Auth check (Admin only - for MVP, any user can do this, detailed roles later)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from('events')
        .update({ status: 'approved' })
        .eq('id', eventId)

    if (error) {
        console.error('Approve event error:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}

export async function rejectEvent(eventId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from('events')
        .update({ status: 'rejected' })
        .eq('id', eventId)

    if (error) {
        console.error('Reject event error:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Verify ownership
    const { data: event } = await supabase
        .from('events')
        .select('creator_user_id')
        .eq('id', eventId)
        .single()

    if (!event) return { error: "Event not found" }

    if (event.creator_user_id !== user.id) {
        return { error: "Unauthorized: You do not own this event" }
    }

    try {
        // 1. Try with Service Role (Admin) Client first
        // This bypasses RLS if the migration wasn't applied
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminSupabase = createServiceRoleClient();

        console.log('[deleteEvent] Attempting delete with Admin Client...');
        const { error: adminError } = await adminSupabase
            .from('events')
            .delete()
            .eq('id', eventId)

        if (!adminError) {
            console.log('[deleteEvent] Admin delete successful');
            revalidatePath('/host/events')
            revalidatePath('/')
            return { success: true }
        }

        console.error('[deleteEvent] Admin delete failed:', adminError);
        // If admin delete fails (e.g. key missing/invalid), fall through to standard delete
    } catch (e) {
        console.error('[deleteEvent] Service role client init failed (likely missing SUPABASE_SERVICE_ROLE_KEY):', e);
        // Fall through to standard delete
    }

    // 2. Fallback to Standard User Client
    // This works if the RLS policy is correctly set (e.g. via migration 012)
    console.log('[deleteEvent] Falling back to Standard User Client...');
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

    if (error) {
        console.error('[deleteEvent] Standard delete error:', error)
        return { error: `Delete failed: ${error.message}` }
    }

    console.log('[deleteEvent] Standard delete successful');
    revalidatePath('/host/events')
    revalidatePath('/')
    return { success: true }
}
