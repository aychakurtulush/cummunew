import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16' as any
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
        return new Response("Missing account_id", { status: 400 });
    }

    try {
        const account = await stripe.accounts.retrieve(accountId);

        // You could verify if account.details_submitted is true before redirecting to success
        // But for this MVP, just returning to the settings page allows them to try again if failed.

        if (account.details_submitted) {
            // Depending on architecture, you could update a local flag
            // e.g. supabase.from('profiles').update({ stripe_onboarding_complete: true })
        }

    } catch (e) {
        console.error("Error retrieving Stripe account:", e);
    }

    // Always redirect back to settings for MVP
    redirect('/host/settings');
}
