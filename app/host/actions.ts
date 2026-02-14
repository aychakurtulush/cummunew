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
        start_time: new Date(formData.get('start_time') as string).toISOString(),
        end_time: formData.get('end_time') ? new Date(formData.get('end_time') as string).toISOString() : new Date(new Date(formData.get('start_time') as string).getTime() + 2 * 60 * 60 * 1000).toISOString(),
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
