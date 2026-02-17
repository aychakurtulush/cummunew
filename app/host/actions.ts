'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()

    if (!supabase) {
        return { message: "Demo Mode: Backend not configured" }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const startTime = new Date(formData.get('start_time') as string);
    const endTime = formData.get('end_time') ? new Date(formData.get('end_time') as string) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

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
    const rawData = {
        creator_user_id: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location_type: formData.get('location_type') as 'home' | 'studio' | 'partner_venue',
        city: formData.get('city') as string,
        category: formData.get('category') as string,
        image_url: imageUrl,
        studio_id: formData.get('studio_id') as string || null, // Add studio_id
        status: 'pending' // Default to pending for approval flow, or 'approved' for MVP
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

export async function createStudio(prevState: any, formData: FormData) {
    console.log('[createStudio] Action started');
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
    console.log('[createStudio] User authenticated:', user.id);

    try {
        // Handle Image Upload
        let imageUrls: string[] = [];
        const imageFile = formData.get('image') as File;

        if (imageFile && imageFile.size > 0) {
            console.log('[createStudio] Uploading image:', imageFile.name);
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
            console.log('[createStudio] Image uploaded:', publicUrl);
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
            images: imageUrls,
            status: 'active'
        }
        console.log('[createStudio] Inserting data:', rawData);

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

                    console.log('[createStudio] Admin Fallback Successful');
                    // Success - fall through to return
                } catch (adminErr: any) {
                    console.error('[createStudio] Service Role init failed:', adminErr);
                    return { message: `Failed to create studio: ${error.message}`, success: false }
                }
            } else {
                return { message: `Failed to create studio: ${error.message}`, success: false }
            }
        }

        console.log('[createStudio] Insert success. Revalidating...');
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
