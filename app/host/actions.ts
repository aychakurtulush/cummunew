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
    const supabase = await createClient()

    if (!supabase) {
        return { message: "Demo Mode: Backend not configured" }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

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
            console.error('STORAGE ERROR uploading studio image:', uploadError);
            return { message: `Failed to upload image: ${uploadError.message}` };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('studio-images')
            .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
    }

    // Parse Amenities (comma separated string to array)
    const amenitiesString = formData.get('amenities') as string;
    const amenities = amenitiesString
        ? amenitiesString.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

    const rawData = {
        owner_user_id: user.id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        location: formData.get('location') as string,
        price_per_hour: parseFloat(formData.get('price_per_hour') as string),
        capacity: parseInt(formData.get('capacity') as string),
        amenities: amenities,
        images: imageUrls,
        status: 'active' // Auto-active for MVP
    }

    const { error } = await supabase
        .from('studios')
        .insert(rawData)

    if (error) {
        console.error('SERVER ERROR creating studio:', error)
        return { message: `Failed to create studio: ${error.message}` }
    }

    revalidatePath('/host/studios');
    revalidatePath('/');
    redirect('/host/studios');
}
