'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
    const priceStr = formData.get('price') as string
    const price = priceStr ? parseFloat(priceStr) : 0
    const capacityStr = formData.get('capacity') as string
    const capacity = capacityStr ? parseInt(capacityStr) : 0

    if (isNaN(price) || isNaN(capacity)) {
        return { message: "Price and capacity must be valid numbers." }
    }

    const imageFile = formData.get('image') as File | null
    let image_url = null

    // Upload image if present
    if (imageFile && imageFile.size > 0) {
        try {
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
        } catch (e) {
            console.error('Image processing error:', e)
            return { message: "Error processing image upload" }
        }
    }

    const location_name = formData.get('location_name') as string || null
    const location_address = formData.get('location_address') as string || null

    let start_time: string, end_time: string
    try {
        const startStr = formData.get('start_time') as string
        const endStr = formData.get('end_time') as string
        if (!startStr || !endStr) {
            return { message: "Start and end times are required." }
        }
        start_time = new Date(startStr).toISOString()
        end_time = new Date(endStr).toISOString()
    } catch (e) {
        return { message: "Invalid date format provided." }
    }

    if (location_type === 'studio' && studio_id) {
        // 1. Fetch studio location to use as city
        const { data: studio } = await supabase.from('studios').select('location, name').eq('id', studio_id).single()
        city = studio?.location || "Berlin"

        // 2. Check for overlapping events in the same studio
        const { data: overlappingEvents } = await supabase
            .from('events')
            .select('id')
            .eq('studio_id', studio_id)
            .eq('status', 'approved')
            .lt('start_time', end_time)
            .gt('end_time', start_time)
            .limit(1);

        if (overlappingEvents && overlappingEvents.length > 0) {
            return { message: "Studio is already booked for this time." }
        }
    }

    if (!city) {
        city = "Berlin" // Fallback since city is NOT NULL
    }

    const payment_instructions = formData.get('payment_instructions') as string || null

    try {
        const { error: insertError } = await supabase.from('events').insert({
            creator_user_id: user.id,
            studio_id: location_type === 'studio' ? studio_id : null,
            location_name,
            location_address,
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
            payment_instructions,
            status: 'approved' // Automatically approve for MVP
        })

        if (insertError) {
            console.error('Create event database error:', insertError)
            return { message: insertError.message }
        }

        revalidatePath('/')
        revalidatePath('/host')
        revalidatePath('/host/events')
    } catch (err: any) {
        // Next.js redirects work by throwing a special error
        if (err?.digest?.includes('NEXT_REDIRECT')) {
            throw err
        }
        console.error('Unexpected error in createEvent action:', err)
        return { message: err.message || "An unexpected error occurred while saving the event." }
    }

    redirect('/host/events?success=created')
}
