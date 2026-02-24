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

    const { data: profile } = await supabase.from('profiles').select('stripe_account_id').eq('user_id', user.id).single();
    let accountId = profile?.stripe_account_id;

    if (!accountId) {
        const account = await stripe.accounts.create({
            type: 'express',
        });
        accountId = account.id;
        // We must use the service role client if RLS prevents updates to other fields, but we should be able to update our own profile.
        const { error } = await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('user_id', user.id);
        if (error) {
            console.error("Failed to update profile with Stripe ID:", error);
            throw new Error("Database error");
        }
    }

    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/host/settings`,
        return_url: `${origin}/api/stripe/connect?account_id=${accountId}`,
        type: 'account_onboarding',
    });

    redirect(accountLink.url);
}
