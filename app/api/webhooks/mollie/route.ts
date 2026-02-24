import { NextResponse } from 'next/server';
import { createMollieClient, PaymentStatus } from '@mollie/api-client';
import { createServiceRoleClient } from '@/lib/supabase/service';

const mollieClient = createMollieClient({
    apiKey: process.env.MOLLIE_API_KEY || 'test_placeholder_key_for_mollie'
});

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const urlParams = new URLSearchParams(text);
        const paymentId = urlParams.get('id');

        if (!paymentId) {
            return NextResponse.json({ error: 'Missing payment ID in urlencoded body' }, { status: 400 });
        }

        const payment = await mollieClient.payments.get(paymentId);

        const metadata = payment.metadata as Record<string, any>;
        const bookingId = metadata?.bookingId;
        const eventId = metadata?.eventId;

        if (!bookingId) {
            return NextResponse.json({ error: 'No booking ID in metadata' }, { status: 400 });
        }

        const supabaseAdmin = createServiceRoleClient();
        if (!supabaseAdmin) {
            console.error("No service role client configured for Webhooks");
            return NextResponse.json({ error: 'Database Admin fail' }, { status: 500 });
        }

        if (payment.status === PaymentStatus.paid) {
            // Update booking to confirmed
            await supabaseAdmin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);

            // Re-fetch booking to send notification
            const { data: booking } = await supabaseAdmin
                .from('bookings')
                .select(`
                    user_id,
                    event_id,
                    events ( title, creator_user_id )
                `)
                .eq('id', bookingId)
                .single();

            if (booking) {
                // @ts-ignore
                const eventTitle = booking.events?.title || 'an event';
                // @ts-ignore
                const hostId = booking.events?.creator_user_id;

                // Notify the Host
                await supabaseAdmin.from('notifications').insert({
                    user_id: hostId,
                    type: 'booking_request',
                    title: 'New Paid Booking',
                    message: `A participant successfully paid and booked "${eventTitle}"`,
                    link: '/host/events',
                    metadata: { booking_id: bookingId, event_id: eventId }
                });

                // Email the Participant
                const { data: userObj } = await supabaseAdmin.auth.admin.getUserById(booking.user_id);
                if (userObj?.user?.email) {
                    const { sendBookingStatusEmail } = await import('@/lib/email');
                    await sendBookingStatusEmail(userObj.user.email, eventTitle as string, 'confirmed');
                }
            }

        } else if ([PaymentStatus.failed, PaymentStatus.canceled, PaymentStatus.expired].includes(payment.status as PaymentStatus)) {
            await supabaseAdmin.from('bookings').update({ status: 'declined' }).eq('id', bookingId);
        }

        return new NextResponse("OK", { status: 200 });

    } catch (error: any) {
        console.error("Mollie Webhook Error:", error);
        return new NextResponse("Webhook error: " + error.message, { status: 500 });
    }
}
