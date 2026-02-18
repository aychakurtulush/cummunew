'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReport(prevState: any, formData: FormData) {
    const supabase = await createClient();

    if (!supabase) {
        return { error: 'Service Unavailable' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to submit a report.' };
    }

    const targetType = formData.get('targetType') as string;
    const targetId = formData.get('targetId') as string;
    const reason = formData.get('reason') as string;
    const details = formData.get('details') as string;

    if (!targetType || !targetId || !reason) {
        return { error: 'Missing required fields.' };
    }

    try {

        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                target_type: targetType,
                target_id: targetId,
                reason: reason,
                details: details,
                status: 'pending'
            });

        if (error) {
            console.error('Report submission error:', error);
            return { error: 'Failed to submit report. Please try again.' };
        }

        return { success: 'Report submitted successfully. Thank you for helping keep our community safe.' };

    } catch (err) {
        console.error('Unexpected error:', err);
        return { error: 'An unexpected error occurred.' };
    }
}
