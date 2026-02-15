'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Not authenticated' };
    }

    const fullName = formData.get('full_name') as string;
    const bio = formData.get('bio') as string;
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
        user_id: user.id,
        full_name: fullName,
        bio: bio,
        updated_at: new Date().toISOString(),
    };

    if (avatarUrl) {
        updates.avatar_url = avatarUrl;
    }

    const { error } = await supabase
        .from('profiles')
        .upsert(updates);

    if (error) {
        return { message: `Error updating profile: ${error.message}` };
    }

    revalidatePath('/profile');
    return { success: true, message: 'Profile updated successfully!' };
}
