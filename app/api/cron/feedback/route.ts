import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendFeedbackEmail } from '@/lib/email-feedback';

// This route should be protected, e.g., called via a secure cron job service (Vercel Cron, GitHub Actions, etc.)
// For Vercel Cron, you can verify the authorization header: process.env.CRON_SECRET

export async function GET(request: Request) {
    // 1. Verify Authorization (Example for Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createServiceRoleClient();

    try {
        // 2. Find events that ended more than 24 hours ago
        // We use the service role client to bypass RLS

        // Calculate the threshold time: 24 hours ago
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - 24);
        const thresholdISODate = thresholdDate.toISOString();

        // 3. Find confirmed bookings for those events where feedback_sent is false
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id,
                user_id,
                events!inner(
                    id,
                    title,
                    end_time
                )
            `)
            .eq('status', 'confirmed')
            .eq('feedback_sent', false)
            .lt('events.end_time', thresholdISODate);

        if (bookingsError) {
            console.error('[Feedback Cron] Error fetching bookings:', bookingsError);
            return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No pending feedback emails to send.' });
        }

        let sentCount = 0;
        let errorCount = 0;

        // 4. Send emails and update status
        for (const booking of bookings) {
            try {
                // Fetch user email using admin API
                const { data: userData, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);

                if (userError || !userData.user?.email) {
                    console.error(`[Feedback Cron] Skipping booking ${booking.id}: User not found or no email`);
                    errorCount++;
                    continue;
                }

                const userEmail = userData.user.email;
                const eventData = Array.isArray(booking.events) ? booking.events[0] : booking.events;
                const eventTitle = eventData?.title || 'the event';
                const eventId = eventData?.id;

                if (!eventId) {
                    errorCount++;
                    continue;
                }

                // Send Email
                await sendFeedbackEmail(userEmail, eventTitle, eventId);

                // Update booking flag
                await supabase
                    .from('bookings')
                    .update({ feedback_sent: true })
                    .eq('id', booking.id);

                sentCount++;

            } catch (e) {
                console.error(`[Feedback Cron] Error processing booking ${booking.id}:`, e);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed feedback emails`,
            sent: sentCount,
            errors: errorCount
        });

    } catch (e) {
        console.error('[Feedback Cron] Critical error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
