'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleStudioFollow(studioId: string) {
    const supabase = await createClient();

    if (!supabase) return { message: "Database not available", isFollowing: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "Unauthorized", isFollowing: false };

    // Check if following
    const { data: existing } = await supabase
        .from('studio_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('studio_id', studioId)
        .single();

    if (existing) {
        // Unfollow
        await supabase.from('studio_follows').delete().eq('id', existing.id);
        revalidatePath('/saved');
        revalidatePath(`/studios/${studioId}`);
        return { message: "Unfollowed", isFollowing: false };
    } else {
        // Follow
        await supabase.from('studio_follows').insert({
            user_id: user.id,
            studio_id: studioId
        });
        revalidatePath('/saved');
        revalidatePath(`/studios/${studioId}`);
        return { message: "Following", isFollowing: true };
    }
}

export async function getIsFollowing(studioId: string) {
    const supabase = await createClient();
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('studio_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('studio_id', studioId)
        .single();

    return !!data;
}
