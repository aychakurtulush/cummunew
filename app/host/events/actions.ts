'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleAttendance(bookingId: string, attended: boolean) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Verify host ownership via the booking -> event relationship
    const { data: booking } = await supabase
        .from('bookings')
        .select(`
            id,
            event_id,
            events (
                creator_user_id
            )
        `)
        .eq('id', bookingId)
        .single()

    if (!booking) return { error: "Booking not found" }

    // @ts-ignore
    if (booking.events?.creator_user_id !== user.id) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from('bookings')
        .update({ attended: attended })
        .eq('id', bookingId)

    if (error) {
        console.error('Error toggling attendance:', error)
        return { error: error.message }
    }

    revalidatePath(`/host/events/${booking.event_id}`)
    return { success: true }
}
