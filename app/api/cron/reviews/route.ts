import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendReviewRequestEmail } from '@/lib/email';

export async function GET(request: Request) {
    // 1. Verify Authorization
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createServiceRoleClient();

    try {
        // 2. Find events that ended in the last 24 hours
        const nowISO = new Date().toISOString();
        const yesterdayISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // 3. Find confirmed, checked-in bookings for these events where no review request was sent
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id,
                user_id,
                events!inner(
                    id,
                    title,
                    end_time,
                    profiles:creator_user_id (
                        full_name
                    )
                )
            `)
            .eq('status', 'confirmed')
            .eq('checked_in', true)
            .eq('review_sent', false)
            .lt('events.end_time', nowISO)
            .gt('events.end_time', yesterdayISO);

        if (bookingsError) {
            console.error('[Reviews Cron] Error fetching bookings:', bookingsError);
            return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No review requests to send.' });
        }

        let sentCount = 0;
        let errorCount = 0;

        // 4. Send emails
        for (const booking of bookings) {
            try {
                const { data: userData, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);

                if (userError || !userData.user?.email) {
                    console.error(`[Reviews Cron] User not found or no email for booking ${booking.id}`);
                    errorCount++;
                    continue;
                }

                const userEmail = userData.user.email;
                const event = Array.isArray(booking.events) ? booking.events[0] : (booking.events as any);
                const hostName = event.profiles?.full_name || 'your host';

                // Send Email
                await sendReviewRequestEmail(userEmail, event.title, hostName, booking.id);

                // Update booking flag
                await supabase
                    .from('bookings')
                    .update({ review_sent: true })
                    .eq('id', booking.id);

                sentCount++;

            } catch (e) {
                console.error(`[Reviews Cron] Error processing booking ${booking.id}:`, e);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            errors: errorCount
        });

    } catch (e) {
        console.error('[Reviews Cron] Critical error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
