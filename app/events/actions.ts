'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { headers } from 'next/headers'

export async function bookEvent(formData: FormData) {
    const eventId = formData.get('eventId') as string

    const supabase = await createClient()
    if (!supabase) return { error: "Demo Mode: Backend not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Check if already booked
    const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

    if (existingBooking) return { success: true, message: "Already booked" }

    // Fetch event details
    const { data: eventData } = await supabase
        .from('events')
        .select('title, creator_user_id, price')
        .eq('id', eventId)
        .single();

    if (!eventData) return { error: "Event not found" }

    // Insert booking
    const { data: insertedBooking, error } = await supabase
        .from('bookings')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'pending' // pending until payment/host approval
        })
        .select('id')
        .single()

    if (error || !insertedBooking) {
        return { error: error?.message || "Failed to create booking" }
    }

    const bookingId = insertedBooking.id;

    // All bookings (Free and Paid) follow the same flow now.
    // They are saved as 'pending' and we notify the host.
    // The Host will review and if they approve, the participant will receive an email with Payment Instructions.

    // --- Email Notification Start ---
    try {
        await supabase
            .from('notifications')
            .insert({
                user_id: eventData.creator_user_id,
                type: 'booking_request',
                title: 'New Booking Request',
                message: `${user.user_metadata?.full_name || 'Someone'} requested to join "${eventData.title}"`,
                link: '/host/events',
                metadata: { event_id: eventId, booking_id: 'pending' }
            });

        if (user.email) {
            const { sendBookingNotification } = await import('@/lib/email');
            await sendBookingNotification(user.email, eventData.title, eventId);
        }
    } catch (notificationError) {
        console.error('[bookEvent] Notification failed');
    }

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
            id,
            user_id,
            status,
            event_id,
            event:events (
                id,
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

    // --- Waitlist Notification Logic ---
    // If a confirmed booking was cancelled, notify the first person on the waitlist
    if (booking.status === 'confirmed') {
        try {
            const { data: waitlistEntry } = await supabase
                .from('waitlist')
                .select(`
                    id,
                    user_id
                `)
                .eq('event_id', booking.event_id)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();

            if (waitlistEntry) {
                // Fetch user email using admin client
                const { createServiceRoleClient } = await import('@/lib/supabase/service');
                const adminSupabase = createServiceRoleClient();
                const { data: waitlistUser } = await adminSupabase.auth.admin.getUserById(waitlistEntry.user_id);

                if (waitlistUser?.user?.email) {
                    const { sendWaitlistOpeningEmail } = await import('@/lib/email');
                    await sendWaitlistOpeningEmail(
                        waitlistUser.user.email,
                        eventTitle,
                        booking.event_id
                    );

                    // Update notified_at to track notification
                    await supabase
                        .from('waitlist')
                        .update({ notified_at: new Date().toISOString() })
                        .eq('id', waitlistEntry.id);
                }
            }
        } catch (waitlistError) {
            console.error('Waitlist notification failed:', waitlistError);
        }
    }

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
                creator_user_id,
                start_time,
                location_type,
                city,
                payment_instructions
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
                booking.events as any,
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

export async function joinWaitlist(eventId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Backend not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from('waitlist')
        .insert({
            event_id: eventId,
            user_id: user.id
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { success: true, message: "Already on waitlist" }
        }
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}`)
    return { success: true }
}

export async function leaveWaitlist(eventId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Backend not configured" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}`)
    return { success: true }
}

export async function sendBroadcastMessage(eventId: string, message: string) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database connection failed" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // 1. Verify Ownership
    const { data: event } = await supabase
        .from('events')
        .select('creator_user_id, title')
        .eq('id', eventId)
        .single();

    if (!event || event.creator_user_id !== user.id) {
        return { error: "Unauthorized" };
    }

    // 2. Fetch all confirmed participants
    const { data: bookings } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

    if (!bookings || bookings.length === 0) {
        return { error: "No confirmed attendees to message" };
    }

    // 3. Get all emails
    const { createServiceRoleClient } = await import('@/lib/supabase/service');
    const adminSupabase = createServiceRoleClient();

    const userIds = bookings.map(b => b.user_id);
    const userEmails: string[] = [];

    // Next.js/Supabase doesn't have a bulk 'getUsers' easily, so we loop or use a custom function.
    // Given the small pilot scale, sequential is fine for now, but we can parallelize.
    const emailPromises = userIds.map(id => adminSupabase.auth.admin.getUserById(id));
    const userResults = await Promise.all(emailPromises);

    userResults.forEach(res => {
        if (res.data?.user?.email) {
            userEmails.push(res.data.user.email);
        }
    });

    if (userEmails.length === 0) {
        return { error: "No emails found for attendees" };
    }

    // 4. Send Broadcast
    const { sendBroadcastEmail } = await import('@/lib/email');
    await sendBroadcastEmail(userEmails, event.title, message);

    // 5. Log the message (optional)
    // We could create a 'broadcasts' table later if needed.

    return { success: true };
}

export async function toggleFollow(hostId: string) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database connection failed" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    if (user.id === hostId) return { error: "You cannot follow yourself" };

    // Check if following
    const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('host_id', hostId)
        .single();

    if (existing) {
        // Unfollow
        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('id', existing.id);

        if (error) return { error: error.message };
        return { success: true, isFollowing: false };
    } else {
        // Follow
        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: user.id,
                host_id: hostId
            });

        if (error) return { error: error.message };
        return { success: true, isFollowing: true };
    }
}
