'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Stripe from 'stripe';
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16' as any // Use a generic recent version
});

export async function createStripeAccountLink(formData: FormData) {
    const supabase = await createClient();
    if (!supabase) throw new Error("Database unavailable");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    let origin = 'http://localhost:3000';
    try {
        const reqHeaders = await headers();
        const host = reqHeaders.get('host');
        const proto = reqHeaders.get('x-forwarded-proto') || 'http';
        if (host) {
            origin = `${proto}://${host}`;
        }
    } catch (e) { /* ignore */ }

    try {
        const { data: profile } = await supabase.from('profiles').select('stripe_account_id').eq('user_id', user.id).single();
        let accountId = profile?.stripe_account_id;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
            });
            accountId = account.id;
            // Update profile
            const { error: dbError } = await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('user_id', user.id);
            if (dbError) {
                console.error("Database error saving Stripe ID:", dbError);
                throw new Error("Could not save your Stripe ID to the database.");
            }
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/host/settings`,
            return_url: `${origin}/host/settings?success=stripe_connected`,
            type: 'account_onboarding',
        });

        // Safe redirect
        redirect(accountLink.url);

    } catch (err: any) {
        console.error("Stripe onboarding error:", err);
        // Important: We must not catch 'NEXT_REDIRECT' errors, so we check the message
        if (err.message && err.message === 'NEXT_REDIRECT') {
            throw err;
        }

        // If it's a real error, redirect back to settings with the error message
        redirect(`/host/settings?error=${encodeURIComponent(err.message || 'Payment system error')}`);
    }
}
