import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    const supabase = await createClient();
    if (!supabase) return new NextResponse('Database Unavailable', { status: 500 });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = process.env.MOLLIE_CLIENT_ID;
    if (!clientId) {
        return NextResponse.redirect(new URL('/host/settings?error=Platform Mollie Client ID not configured', req.url));
    }

    const reqHeaders = await headers();
    const host = reqHeaders.get('host');
    const proto = reqHeaders.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    // Pass the user ID in the state so we can securely identify them in the callback
    const state = user.id;

    const authUrl = new URL('https://my.mollie.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', `${origin}/api/mollie/callback`);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'payments.read payments.write profiles.read organizations.read onboarding.read');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('approval_prompt', 'auto');

    return NextResponse.redirect(authUrl.toString());
}
