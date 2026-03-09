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

    const acceptTerms = formData.get('accept_terms') === 'on' || formData.get('accept_terms') === 'true'
    if (!acceptTerms) {
        redirect('/signup?error=You must accept the Terms of Service and Privacy Policy to create an account.')
    }

    const signupData = {
        email: (formData.get('email') as string).trim(),
        password: (formData.get('password') as string).trim(),
        options: {
            data: {
                full_name: formData.get('full_name') as string,
                terms_accepted_at: new Date().toISOString(),
            }
        }
    }

    const { data, error } = await supabase.auth.signUp(signupData)

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // If session is null, it means either:
    // 1. Email confirmation is required (Supabase default)
    // 2. The user already exists (Supabase security feature: it returns success but no session to prevent enumeration)
    if (!data.session) {
        const isExistingUser = data.user?.identities?.length === 0

        if (isExistingUser) {
            redirect('/signup?error=This email is already registered. Please log in to your account instead.')
        } else {
            // New user, but needs email confirmation
            redirect('/signup?error=Please check your email to confirm your account and log in.')
        }
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
