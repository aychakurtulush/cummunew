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

export async function createEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()
    if (!supabase) return { message: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Not authenticated" }

    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const seating_type = formData.get('seating_type') as string
    const materials_provided = formData.get('materials_provided') === 'true'
    const is_guided = formData.get('is_guided') === 'true'
    const location_type = formData.get('location_type') as string
    const studio_id = formData.get('studio_id') as string || null
    let city = formData.get('city') as string || ""
    const start_time = new Date(formData.get('start_time') as string).toISOString()
    const end_time = new Date(formData.get('end_time') as string).toISOString()
    const price = parseFloat(formData.get('price') as string)
    const capacity = parseInt(formData.get('capacity') as string)

    const imageFile = formData.get('image') as File | null
    let image_url = null

    // Upload image if present
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(filePath, imageFile)

        if (uploadError) {
            console.error('Image upload error:', uploadError)
            return { message: "Failed to upload image" }
        }

        const { data: publicUrlData } = supabase.storage.from('event-images').getPublicUrl(filePath)
        image_url = publicUrlData.publicUrl
    }

    if (location_type === 'studio' && studio_id) {
        // Fetch studio location to use as city
        const { data: studio } = await supabase.from('studios').select('location').eq('id', studio_id).single()
        city = studio?.location || "Berlin"
    }

    if (!city) {
        city = "Berlin" // Fallback since city is NOT NULL
    }

    const { error } = await supabase.from('events').insert({
        creator_user_id: user.id,
        studio_id: location_type === 'studio' ? studio_id : null,
        title,
        description,
        price,
        capacity,
        start_time,
        end_time,
        location_type,
        city,
        category,
        image_url,
        seating_type,
        materials_provided,
        is_guided,
        status: 'approved' // Automatically approve for MVP
    })

    if (error) {
        console.error('Create event error:', error)
        return { message: error.message }
    }

    revalidatePath('/')
    revalidatePath('/host')
    revalidatePath('/host/events')

    // Normally we use redirect(), but inside useActionState it's better to return success
    // However, if we want to redirect to the dashboard:
    // Actually, returning a special message we can handle on the client, or redirecting from server.
    // We cannot use redirect() inside a try-catch for Server Actions cleanly unless we catch it carefully.
    // Let's rely on standard Next.js redirect propagation.
}
