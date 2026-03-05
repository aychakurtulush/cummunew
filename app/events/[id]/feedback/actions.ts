'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(eventId: string, rating: number, comment: string) {
    const supabase = await createClient()

    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Double check they haven't submitted already (server side enforcement)
    const { data: existingFeedback } = await supabase
        .from('event_feedback')
        .select('id')
        .eq('event_id', eventId)
        .eq('guest_id', user.id)
        .single()

    if (existingFeedback) {
        return { error: "Feedback already submitted for this event" }
    }

    const { error } = await supabase
        .from('event_feedback')
        .insert({
            event_id: eventId,
            guest_id: user.id,
            rating,
            comment: comment.trim() || null
        })

    if (error) {
        console.error('Feedback insertion error:', error)
        return { error: "Failed to submit feedback. " + error.message }
    }

    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/host/events`) // Host dashboard might show ratings eventually

    return { success: true }
}
