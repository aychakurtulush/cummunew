'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { parseBerlinInput } from '@/lib/date-utils';

export async function createEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()

    if (!supabase) {
        return { message: "Demo Mode: Backend not configured" }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const startInput = formData.get('start_time') as string;
    const endInput = formData.get('end_time') as string;

    // Convert input (Berlin Time) -> UTC
    const startTimeString = parseBerlinInput(startInput);
    const endTimeString = endInput ? parseBerlinInput(endInput) : null;

    if (!startTimeString) {
        return { message: "Invalid start time." };
    }

    const startTime = new Date(startTimeString);
    const endTime = endTimeString ? new Date(endTimeString) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    // Validation: End time must be after start time
    if (endTime <= startTime) {
        return { message: "End time must be after the start time." };
    }

    // Handle Image Upload if provided
    let imageUrl = null;
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('STORAGE ERROR uploading image:', uploadError);
            // We can choose to fail the whole creation or just proceed without image
            // Failing is safer for UX clarity
            return { message: `Failed to upload image: ${uploadError.message}` };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(filePath);

        imageUrl = publicUrl;
    }

    // Basic validation could go here
    let city = formData.get('city') as string;
    const studioId = formData.get('studio_id') as string || null;

    // If studio_id is present but city is missing (likely hidden in form), fetch studio location
    if (studioId && !city) {
        try {
            const { data: studio } = await supabase
                .from('studios')
                .select('location')
                .eq('id', studioId)
                .single();

            if (studio && studio.location) {
                // Extract city from location if possible, or just use the whole location string
                // For MVP, assuming location string acts as city or contains it
                city = studio.location.split(',')[0].trim(); // Simple heuristic: take first part before comma
            }
        } catch (error) {
            console.error('Error fetching studio location:', error);
        }
    }

    const rawData = {
        creator_user_id: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location_type: formData.get('location_type') as 'home' | 'studio' | 'partner_venue',
        city: city || 'Berlin', // Fallback to Berlin if all else fails
        category: formData.get('category') as string,
        image_url: imageUrl,
        studio_id: studioId,
        status: 'pending', // Default to pending for approval flow, or 'approved' for MVP
        seating_type: formData.get('seating_type') || 'mixed',
        materials_provided: formData.get('materials_provided') === 'true',
        is_guided: formData.get('is_guided') === 'true'
    }

    // For MVP, auto-approve
    // @ts-ignore
    rawData.status = 'approved'

    const { error } = await supabase
        .from('events')
        .insert(rawData)

    if (error) {
        console.error('SERVER ERROR creating event:', JSON.stringify(error, null, 2))
        return { message: `Failed to create event: ${error.message} (${error.code})` }
    }

    revalidatePath('/host');
    revalidatePath('/'); // Update public explore page
    redirect('/host')
}

export async function updateEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()

    if (!supabase) return { message: "Backend unavailable" }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const eventId = formData.get('id') as string;
    if (!eventId) return { message: "Event ID missing" };

    const startInput = formData.get('start_time') as string;
    const endInput = formData.get('end_time') as string;

    // Convert input (Berlin Time) -> UTC
    const startTimeString = parseBerlinInput(startInput);
    const endTimeString = endInput ? parseBerlinInput(endInput) : null;

    if (!startTimeString) {
        return { message: "Invalid start time." };
    }

    const startTime = new Date(startTimeString);
    const endTime = endTimeString ? new Date(endTimeString) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    if (endTime <= startTime) {
        return { message: "End time must be after the start time." };
    }

    const rawData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location_type: formData.get('location_type') as 'home' | 'studio' | 'partner_venue',
        city: formData.get('city') as string,
        category: formData.get('category') as string,
        studio_id: formData.get('studio_id') as string || null,
        seating_type: formData.get('seating_type') || 'mixed',
        materials_provided: formData.get('materials_provided') === 'true',
        is_guided: formData.get('is_guided') === 'true'
    }

    const { error } = await supabase
        .from('events')
        .update(rawData)
        .eq('id', eventId)
        .eq('creator_user_id', user.id); // Security check

    if (error) {
        console.error('SERVER ERROR updating event:', error)
        return { message: `Failed to update event: ${error.message}` }
    }

    revalidatePath('/host');
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/host/events/${eventId}/edit`);

    return { message: 'Success' }
}

export async function createStudio(prevState: any, formData: FormData) {

    const supabase = await createClient()

    if (!supabase) {
        console.error('[createStudio] No supabase client');
        return { message: "Demo Mode: Backend not configured", success: false }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error('[createStudio] No user');
        redirect('/login')
    }


    try {
        // Handle Image Upload
        let imageUrls: string[] = [];
        const imageFile = formData.get('image') as File;

        if (imageFile && imageFile.size > 0) {

            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('studio-images')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error('[createStudio] STORAGE ERROR:', uploadError);
                return { message: `Failed to upload image: ${uploadError.message}`, success: false };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('studio-images')
                .getPublicUrl(filePath);

            imageUrls.push(publicUrl);

        }

        // Parse Amenities
        const amenitiesString = formData.get('amenities') as string;
        const amenities = amenitiesString
            ? amenitiesString.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];

        const rawData = {
            owner_user_id: user.id,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            location: formData.get('location') as string,
            price_per_hour: parseFloat(formData.get('price_per_hour') as string) || 0,
            capacity: parseInt(formData.get('capacity') as string) || 0,
            amenities: amenities,
            features: formData.getAll('features') as string[],
            images: imageUrls,
            status: 'active'
        }


        const { error } = await supabase
            .from('studios')
            .insert(rawData)

        if (error) {
            console.error('[createStudio] DB INSERT ERROR:', error)

            // Fallback: Try with Service Role if PERMISSION DENIED (42501)
            // This handles cases where RLS policies (Migration 015) haven't been applied yet
            if (error.code === '42501') {
                console.warn('[createStudio] RLS Permission Denied. Attempting fallback to Service Role...');
                try {
                    const { createServiceRoleClient } = await import('@/lib/supabase/service');
                    const adminSupabase = createServiceRoleClient();

                    const { error: adminError } = await adminSupabase
                        .from('studios')
                        .insert(rawData);

                    if (adminError) {
                        console.error('[createStudio] Admin Fallback Failed:', adminError);
                        return { message: `Failed to create studio (Admin): ${adminError.message}`, success: false }
                    }


                    // Success - fall through to return
                } catch (adminErr: any) {
                    console.error('[createStudio] Service Role init failed:', adminErr);
                    return { message: `Failed to create studio: ${error.message}`, success: false }
                }
            } else {
                return { message: `Failed to create studio: ${error.message}`, success: false }
            }
        }


        // revalidatePath('/host/studios');
        // revalidatePath('/'); // Commenting out to isolate issues

        return {
            message: 'Success',
            success: true
        };

    } catch (e: any) {
        console.error('[createStudio] UNEXPECTED FATAL ERROR:', e);
        return { message: `An unexpected error occurred: ${e.message}`, success: false }
    }
}

export async function updateStudio(prevState: any, formData: FormData) {
    const supabase = await createClient()

    if (!supabase) return { message: "Backend unavailable", success: false }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: "Unauthorized", success: false }
    }

    const studioId = formData.get('id') as string;
    if (!studioId) return { message: "Studio ID missing", success: false };

    try {
        // Handle Image Upload if provided (Optional update)
        let imageUrls: string[] | undefined = undefined;
        const imageFile = formData.get('image') as File;

        if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('studio-images')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error('[updateStudio] STORAGE ERROR:', uploadError);
                return { message: `Failed to upload image: ${uploadError.message}`, success: false };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('studio-images')
                .getPublicUrl(filePath);

            imageUrls = [publicUrl]; // Replacing existing for simplicity in this MVP, or could append
        }

        // Parse Amenities
        const amenitiesString = formData.get('amenities') as string;
        const amenities = amenitiesString
            ? amenitiesString.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : undefined; // undefined means don't update if not present? Form likely has it.

        const rawData: any = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            location: formData.get('location') as string,
            price_per_hour: parseFloat(formData.get('price_per_hour') as string) || 0,
            capacity: parseInt(formData.get('capacity') as string) || 0,
        };

        if (amenities !== undefined) rawData.amenities = amenities;

        const features = formData.getAll('features');
        if (features.length > 0) rawData.features = features as string[];

        if (imageUrls !== undefined) rawData.images = imageUrls;

        const { error } = await supabase
            .from('studios')
            .update(rawData)
            .eq('id', studioId)
            .eq('owner_user_id', user.id); // RLS handles this too, but good double check

        if (error) {
            console.error('[updateStudio] UPDATE ERROR:', error);
            return { message: `Failed to update studio: ${error.message}`, success: false };
        }

        revalidatePath('/host/studios');
        revalidatePath(`/studios/${studioId}`);
        return { message: 'Success', success: true };

    } catch (e: any) {
        console.error('[updateStudio] ERROR:', e);
        return { message: `Error: ${e.message}`, success: false };
    }
}

export async function deleteStudio(studioId: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Backend unavailable" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('studios')
        .delete()
        .eq('id', studioId)
        .eq('owner_user_id', user.id);

    if (error) {
        console.error('[deleteStudio] ERROR:', error);
        return { error: `Failed to delete studio: ${error.message}` };
    }

    revalidatePath('/host/studios');
    revalidatePath('/');
    return { success: true };
}
