'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient();

    if (!supabase) {
        return { message: 'Backend not configured' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Not authenticated' };
    }

    const fullName = formData.get('full_name') as string;
    const bio = formData.get('bio') as string;
    const instagramUrl = formData.get('instagram_url') as string;
    const websiteUrl = formData.get('website_url') as string;

    const socialLinks = {
        instagram: instagramUrl || null,
        website: websiteUrl || null
    };

    const imageFile = formData.get('avatar') as File;
    let avatarUrl = null;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return { message: `Error uploading avatar: ${uploadError.message}` };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        avatarUrl = publicUrl;
    }

    const updates: any = {
        full_name: fullName,
        bio: bio,
        social_links: socialLinks,
        updated_at: new Date().toISOString(),
    };

    if (avatarUrl) {
        updates.avatar_url = avatarUrl;
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

    if (error) {
        return { message: `Error updating profile: ${error.message}` };
    }

    revalidatePath('/', 'layout');
    return { success: true, message: 'Profile updated successfully!' };
}
