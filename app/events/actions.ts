'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function bookEvent(formData: FormData) {
    const eventId = formData.get('eventId') as string
    const supabase = await createClient()

    if (!supabase) {
        redirect(`/login?error=Demo Mode: Backend not configured&next=/events/${eventId}`)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/login?next=/events/${eventId}`)
    }

    // Check if already booked? (Optional for MVP)

    const { error } = await supabase
        .from('bookings')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'pending' // Host needs to approve
        })

    if (error) {
        console.error('Booking error:', error)
        // redirect to error or show message
        return
    }

    revalidatePath('/bookings')
    redirect('/bookings')
}

export async function toggleWishlist(eventId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Not authenticated" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Check if exists
    const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single()

    if (existing) {
        // Remove
        await supabase
            .from('wishlist')
            .delete()
            .eq('id', existing.id)
    } else {
        // Add
        await supabase
            .from('wishlist')
            .insert({
                user_id: user.id,
                event_id: eventId
            })
    }

    revalidatePath('/')
    revalidatePath('/dashboard/saved')
    revalidatePath(`/events/${eventId}`)

    return { success: true, isLiked: !existing }
}
