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
