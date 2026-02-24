import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16' as any
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_placeholder';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Use the admin client since webhooks run without a user context
    const supabase = createServiceRoleClient();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.client_reference_id;

        if (bookingId) {
            // 1. Update Booking Status
            const { data: booking, error: updateError } = await supabase
                .from('bookings')
                .update({
                    payment_status: 'paid',
                    status: 'confirmed'
                })
                .eq('id', bookingId)
                .select('*, events(title, creator_user_id)')
                .single();

            if (updateError) {
                console.error("Error updating booking payment status:", updateError);
                return new Response("Database Error", { status: 500 });
            }

            if (booking) {
                // 2. Notify Participant
                await supabase.from('notifications').insert({
                    user_id: booking.user_id,
                    type: 'booking_status',
                    title: 'Booking Confirmed!',
                    message: `Your payment for "${booking.events.title}" was successful.`,
                    link: '/bookings',
                    metadata: { booking_id: bookingId, status: 'confirmed' }
                });

                // 3. Notify Host
                await supabase.from('notifications').insert({
                    user_id: booking.events.creator_user_id,
                    type: 'payment_received',
                    title: 'New Paid Booking',
                    message: `You received a new paid booking for "${booking.events.title}". Platform fee deducted.`,
                    link: '/host/events',
                    metadata: { booking_id: bookingId }
                });
            }
        }
    }

    return new Response("Event received", { status: 200 });
}
