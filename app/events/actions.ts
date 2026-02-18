'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function bookEvent(formData: FormData) {
    const eventId = formData.get('eventId') as string


    const supabase = await createClient()

    if (!supabase) {
        console.error('[bookEvent] Supabase client failed');
        return { error: "Demo Mode: Backend not configured" }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {

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



    // --- Email Notification Start ---
    try {
        // Fetch event details for the email and notification
        const { data: eventData } = await supabase
            .from('events')
            .select('title, creator_user_id')
            .eq('id', eventId)
            .single();

        if (eventData) {
            // 1. In-App Notification
            await supabase
                .from('notifications')
                .insert({
                    user_id: eventData.creator_user_id,
                    type: 'booking_request',
                    title: 'New Booking Request',
                    message: `${user.user_metadata?.full_name || 'Someone'} requested to join "${eventData.title}"`,
                    link: '/host/events', // Or link to specific booking logic
                    metadata: { event_id: eventId, booking_id: 'pending' }
                })
                .then(({ error }) => {
                    if (error) console.error('[bookEvent] Notification insert failed:', error);
                });

            // 2. Email Notification
            if (user.email) {
                // Dynamically import to avoid build issues
                const { sendBookingNotification } = await import('@/lib/email');
                await sendBookingNotification(user.email, eventData.title, eventId);
            }
        }
    } catch (notificationError) {
        console.error('[bookEvent] Notification failed (non-critical):', notificationError);
    }
    // --- Email Notification End ---

    revalidatePath('/bookings')
    revalidatePath(`/events/${eventId}`)
    return { success: true }
}

export async function toggleWishlist(eventId: string) {

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

    // Verify ownership and fetch event time
    const { data: booking } = await supabase
        .from('bookings')
        .select(`
            user_id,
            event:events (
                start_time,
                title
            )
        `)
        .eq('id', bookingId)
        .single()

    if (!booking || booking.user_id !== user.id) {
        return { error: "Unauthorized" }
    }

    // 24h Cancellation Policy Check
    // @ts-ignore
    const eventData = Array.isArray(booking.event) ? booking.event[0] : booking.event;
    const eventStartTime = new Date(eventData?.start_time);
    const now = new Date();
    const hoursDifference = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
        return { error: "Cannot cancel less than 24 hours before the event." }
    }

    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

    if (error) {
        console.error('Cancel error:', error)
        return { error: error.message }
    }

    // Send cancellation email
    // @ts-ignore
    const eventTitle = Array.isArray(booking.event) ? booking.event[0]?.title : booking.event?.title;

    if (user.email && eventTitle) {
        try {
            const { sendBookingCancelledEmail } = await import('@/lib/email');
            await sendBookingCancelledEmail(user.email, eventTitle);
        } catch (e) {
            console.error('Failed to send cancellation email:', e);
        }
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
            user_id,
            events (
                title,
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

    // Check capacity if confirming
    if (status === 'confirmed') {
        const eventId = booking.event_id;

        // 1. Get capacity
        const { data: event } = await supabase
            .from('events')
            .select('capacity')
            .eq('id', eventId)
            .single();

        // 2. Get current confirmed count
        const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'confirmed');

        if (event && (count || 0) >= event.capacity) {
            return { error: "Cannot confirm: Event is at full capacity" };
        }
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

    // Notify Participant
    try {
        // @ts-ignore
        const eventTitle = booking.events?.title || 'your event';

        await supabase
            .from('notifications')
            .insert({
                user_id: booking.user_id,
                type: 'booking_status',
                title: `Booking ${status === 'confirmed' ? 'Confirmed' : 'Declined'}`,
                message: `Your booking for "${eventTitle}" has been ${status}.`,
                link: '/bookings',
                metadata: { booking_id: bookingId, status: status }
            });

        // 3. Email Notification to Participant
        // @ts-ignore
        const participantUserId = booking.user_id;

        // We need to fetch the participant's email.
        // Since we are in a server action, `supabase.auth.getUser()` gives US (the Host).
        // We need admin client to get the participant's email by ID.

        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminSupabase = createServiceRoleClient();
        const { data: participantUser } = await adminSupabase.auth.admin.getUserById(participantUserId);

        if (participantUser?.user?.email) {
            const { sendBookingStatusEmail } = await import('@/lib/email');
            await sendBookingStatusEmail(
                participantUser.user.email,
                eventTitle,
                status
            );
        }

    } catch (e) {
        console.error('Notification error:', e);
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


        const { error: adminError } = await adminSupabase
            .from('events')
            .delete()
            .eq('id', eventId)

        if (!adminError) {

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

    const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .select()

    if (error) {
        console.error('[deleteEvent] Standard delete error:', error)
        return { error: `Delete failed: ${error.message}` }
    }

    if (!data || data.length === 0) {
        console.error('[deleteEvent] No rows deleted. Likely RLS permission issue.');
        return { error: "Delete failed: Permission denied. Please ensure migration '012_allow_event_deletion.sql' is applied to your database." }
    }


    revalidatePath('/host/events')
    revalidatePath('/')
    return { success: true }
}
