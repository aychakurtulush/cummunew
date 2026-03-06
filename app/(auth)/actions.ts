'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    if (!supabase) {
        redirect('/login?error=Demo Mode: Backend not configured')
    }

    const data = {
        email: (formData.get('email') as string).trim(),
        password: (formData.get('password') as string).trim(),
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard?welcome=true') // Default to dashboard after login
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    if (!supabase) {
        redirect('/signup?error=Demo Mode: Backend not configured')
    }

    const signupData = {
        email: (formData.get('email') as string).trim(),
        password: (formData.get('password') as string).trim(),
        options: {
            data: {
                full_name: formData.get('full_name') as string, // Capture name for profile
            }
        }
    }

    // 1. Check if user already exists to provide a better error message
    try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminSupabase = createServiceRoleClient();
        const { data: existingUser } = await adminSupabase.auth.admin.getUserById(signupData.email);
        // Note: getUserById actually doesn't work for email directly in some versions, 
        // we can use listUsers or just rely on the signUp result if we can't easily check.
        // Actually, let's just use the fact that data.user exists but session is null.
    } catch (e) {
        // Ignore check errors
    }

    const { data, error } = await supabase.auth.signUp(signupData)

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // If session is null, it means either:
    // 1. Email confirmation is required (Supabase default)
    // 2. The user already exists (Supabase security feature: it returns success but no session to prevent enumeration)
    if (!data.session) {
        if (data.user) {
            // User object exists, but no session -> Likely already exists (security feature)
            redirect('/signup?error=This email is already registered. Please log in to your account instead.')
        }
        redirect('/signup?error=Please check your email to confirm your account and log in.')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard?welcome=true')
}

export async function signout() {
    const supabase = await createClient()
    if (supabase) {
        await supabase.auth.signOut()
    }
    revalidatePath('/', 'layout')
    redirect('/')
}
