import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendEventReminderEmail } from '@/lib/email';

export async function GET(request: Request) {
    // 1. Verify Authorization
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createServiceRoleClient();

    try {
        // 2. Calculate the window: Events starting between NOW and NOW + 50 hours
        const now = new Date();
        const futureThreshold = new Date();
        futureThreshold.setHours(futureThreshold.getHours() + 50);

        const nowISO = now.toISOString();
        const futureISO = futureThreshold.toISOString();

        // 3. Find confirmed bookings with no reminder sent yet
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id,
                user_id,
                events!inner(
                    id,
                    title,
                    start_time,
                    city,
                    payment_instructions
                )
            `)
            .eq('status', 'confirmed')
            .eq('reminder_sent', false)
            .gt('events.start_time', nowISO)
            .lt('events.start_time', futureISO);

        if (bookingsError) {
            console.error('[Reminders Cron] Error fetching bookings:', bookingsError);
            return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No reminders to send.' });
        }

        let sentCount = 0;
        let errorCount = 0;

        // 4. Send emails
        for (const booking of bookings) {
            try {
                // Fetch user email
                const { data: userData, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);

                if (userError || !userData.user?.email) {
                    console.error(`[Reminders Cron] Skipping booking ${booking.id}: User not found or no email`);
                    errorCount++;
                    continue;
                }

                const userEmail = userData.user.email;
                const event = Array.isArray(booking.events) ? booking.events[0] : (booking.events as any);

                if (!event) {
                    console.error(`[Reminders Cron] Skipping booking ${booking.id}: Event data missing`);
                    errorCount++;
                    continue;
                }

                // Send Email
                await sendEventReminderEmail(userEmail, {
                    title: event.title,
                    start_time: event.start_time,
                    city: event.city,
                    payment_instructions: event.payment_instructions
                });

                // Update booking flag
                await supabase
                    .from('bookings')
                    .update({ reminder_sent: true })
                    .eq('id', booking.id);

                sentCount++;

            } catch (e) {
                console.error(`[Reminders Cron] Error processing booking ${booking.id}:`, e);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            errors: errorCount
        });

    } catch (e) {
        console.error('[Reminders Cron] Critical error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
