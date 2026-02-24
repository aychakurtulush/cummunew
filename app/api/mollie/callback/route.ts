import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // User ID passed from Initiator
    const errorParam = url.searchParams.get('error');

    if (errorParam) {
        return NextResponse.redirect(new URL(`/host/settings?error=${encodeURIComponent(errorParam)}`, req.url));
    }

    if (!code || !state) {
        return NextResponse.redirect(new URL('/host/settings?error=Invalid+OAuth+Parameters', req.url));
    }

    const clientId = process.env.MOLLIE_CLIENT_ID;
    const clientSecret = process.env.MOLLIE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(new URL('/host/settings?error=Platform+Mollie+Credentials+Missing', req.url));
    }

    try {
        const reqHeaders = await headers();
        const host = reqHeaders.get('host');
        const proto = reqHeaders.get('x-forwarded-proto') || 'http';
        const origin = `${proto}://${host}`;

        // 1. Exchange the Authorization Code for an Access Token
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenRes = await fetch('https://api.mollie.com/oauth2/tokens', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${origin}/api/mollie/callback`,
            })
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error("Mollie token exchange failed:", errText);
            return NextResponse.redirect(new URL(`/host/settings?error=${encodeURIComponent("Failed to exchange authentication code with Mollie.")}`, req.url));
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;

        // 2. Fetch the Organization ID of the connected account
        const meRes = await fetch('https://api.mollie.com/v2/organizations/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!meRes.ok) {
            console.error("Mollie Organization fetch failed:", await meRes.text());
            return NextResponse.redirect(new URL(`/host/settings?error=${encodeURIComponent("Could not retrieve Organization profile from Mollie.")}`, req.url));
        }

        const meData = await meRes.json();
        const organizationId = meData.id;

        // 3. Save everything to Supabase using Admin client
        const supabaseAdmin = createServiceRoleClient();
        if (!supabaseAdmin) {
            return NextResponse.redirect(new URL(`/host/settings?error=${encodeURIComponent("Database Unavailable")}`, req.url));
        }

        const { error: dbError } = await supabaseAdmin.from('profiles').update({
            mollie_organization_id: organizationId,
            mollie_access_token: accessToken,
            mollie_refresh_token: refreshToken
        }).eq('user_id', state);

        if (dbError) {
            console.error("DB Save failed for Mollie ID:", dbError);
            return NextResponse.redirect(new URL(`/host/settings?error=${encodeURIComponent("Failed to save credentials to profile.")}`, req.url));
        }

        // 4. Success Redirect
        return NextResponse.redirect(new URL('/host/settings?success=mollie_connected', req.url));

    } catch (err: any) {
        console.error("Mollie OAuth Callback Error:", err);
        return NextResponse.redirect(new URL(`/host/settings?error=${encodeURIComponent(err.message || 'Mollie connection error')}`, req.url));
    }
}
