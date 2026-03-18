'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'

export async function bookEvent(formData: FormData) {
    const eventId = formData.get('eventId') as string

    const supabase = await createClient()
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

    // Check if already booked
    const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

    if (existingBooking) return { success: true, message: t('alreadyBooked') }

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
        return { error: error?.message || t('bookingFailed') }
    }

    const bookingId = insertedBooking.id;

    // All bookings (Free and Paid) follow the same flow now.
    // They are saved as 'pending' and we notify the host.
    // The Host will review and if they approve, the participant will receive an email with Payment Instructions.

    // --- Email & Notification Notification Start ---
    try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminSupabase = createServiceRoleClient();

        // 1. Notify Host in-app (Using Admin Client as RLS is now restricted)
        await adminSupabase
            .from('notifications')
            .insert({
                user_id: eventData.creator_user_id,
                type: 'booking_request',
                title: t('notifications.newRequest.title'),
                message: t('notifications.newRequest.message', { 
                    name: user.user_metadata?.full_name || 'Someone',
                    title: eventData.title 
                }),
                link: '/host/inquiries',
                metadata: { event_id: eventId, booking_id: insertedBooking.id }
            });

        // 2. Fetch Host email and notify via email
        const { data: hostUser } = await adminSupabase.auth.admin.getUserById(eventData.creator_user_id);

        if (hostUser?.user?.email) {
            const { sendBookingRequestToHostEmail } = await import('@/lib/email');
            const requesterName = user.user_metadata?.full_name || 'A Guest';
            await sendBookingRequestToHostEmail(
                hostUser.user.email,
                requesterName,
                eventData.title,
                eventId
            );
        }

        // 3. Notify Guest (Confirmation that request was sent)
        if (user.email) {
            const { sendBookingNotification } = await import('@/lib/email');
            await sendBookingNotification(user.email, eventData.title, eventId);
        }
    } catch (notificationError) {
        console.error('[bookEvent] Notification failed:', notificationError);
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

    const t = await getTranslations('actions.events');
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: t('authRequired') }

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
    const t = await getTranslations('actions.events');
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

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
    
    // booking.events is returned as an array by the query
    const event = Array.isArray(booking.events) ? booking.events[0] : booking.events;
    
    if (!event || event.creator_user_id !== user.id) {
        return { error: t('unauthorizedHost') }
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
            return { error: t('eventFull') };
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
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminSupabase = createServiceRoleClient();
        
        // @ts-ignore
        const eventTitle = (event as any)?.title || 'your event';

        await adminSupabase
            .from('notifications')
            .insert({
                user_id: booking.user_id,
                type: 'booking_status',
                title: status === 'confirmed' ? t('notifications.approved.title') : t('notifications.declined.title'),
                message: t('notifications.statusUpdate.message', { 
                    title: eventTitle,
                    status: status === 'confirmed' ? t('status.confirmed') : t('status.declined') 
                }),
                link: '/bookings',
                metadata: { booking_id: bookingId, status: status }
            });

        // 3. Email Notification to Participant
        // @ts-ignore
        const participantUserId = booking.user_id;

        // We need to fetch the participant's email.
        // Since we are in a server action, `supabase.auth.getUser()` gives US (the Host).
        // We need admin client to get the participant's email by ID.

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
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') }
    
    // Auth check (Admin only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

    // Role check
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (profile?.role !== 'admin') return { error: t('adminRequired') };

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
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

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
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

    // Verify ownership
    const { data: event } = await supabase
        .from('events')
        .select('creator_user_id')
        .eq('id', eventId)
        .single()

    if (!event) return { error: t('eventNotFound') || "Event not found" }

    if (event.creator_user_id !== user.id) {
        return { error: t('unauthorizedHost') }
    }

    try {
        // 1. Try with Service Role (Admin) Client first
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
    } catch (e) {
        console.error('[deleteEvent] Service role client init failed:', e);
    }

    // 2. Fallback to Standard User Client
    const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .select()

    if (error) {
        console.error('[deleteEvent] Standard delete error:', error)
        return { error: error.message }
    }

    if (!data || data.length === 0) {
        return { error: "Delete failed: Permission denied." }
    }

    revalidatePath('/host/events')
    revalidatePath('/')
    return { success: true }
}

export async function joinWaitlist(eventId: string) {
    const supabase = await createClient()
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

    const { error } = await supabase
        .from('waitlist')
        .insert({
            event_id: eventId,
            user_id: user.id
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { success: true, message: t('alreadyOnWaitlist') || "Already on waitlist" }
        }
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}`)
    return { success: true }
}

export async function leaveWaitlist(eventId: string) {
    const supabase = await createClient()
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: t('authRequired') }

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
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: t('authRequired') };

    // 1. Verify Ownership
    const { data: event } = await supabase
        .from('events')
        .select('creator_user_id, title')
        .eq('id', eventId)
        .single();

    if (!event || event.creator_user_id !== user.id) {
        return { error: t('unauthorizedHost') };
    }

    // 2. Fetch all confirmed participants
    const { data: bookings } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

    if (!bookings || bookings.length === 0) {
        return { error: t('noConfirmedAttendees') || "No confirmed attendees to message" };
    }

    // 3. Get all emails
    const { createServiceRoleClient } = await import('@/lib/supabase/service');
    const adminSupabase = createServiceRoleClient();

    const userIds = bookings.map(b => b.user_id);
    const userEmails: string[] = [];

    const emailPromises = userIds.map(id => adminSupabase.auth.admin.getUserById(id));
    const userResults = await Promise.all(emailPromises);

    userResults.forEach(res => {
        if (res.data?.user?.email) {
            userEmails.push(res.data.user.email);
        }
    });

    if (userEmails.length === 0) {
        return { error: t('noEmailsFound') || "No emails found for attendees" };
    }

    // 4. Send Broadcast
    const { sendBroadcastEmail } = await import('@/lib/email');
    await sendBroadcastEmail(userEmails, event.title, message);

    return { success: true };
}

export async function toggleFollow(hostId: string) {
    const supabase = await createClient();
    const t = await getTranslations('actions.events');
    const commonT = await getTranslations('common');
    
    if (!supabase) return { error: commonT('error') };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: t('authRequired') };

    if (user.id === hostId) return { error: t('cannotFollowSelf') || "You cannot follow yourself" };

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
