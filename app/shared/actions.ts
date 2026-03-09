'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReport(formData: {
    targetId: string;
    targetType: 'event' | 'studio' | 'user';
    reason: string;
    details: string;
}) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in to report" }

    const { error } = await supabase
        .from('reports')
        .insert({
            reporter_id: user.id,
            target_id: formData.targetId,
            target_type: formData.targetType,
            reason: formData.reason,
            details: formData.details,
            status: 'pending'
        })

    if (error) {
        console.error('Report submission error:', error)
        return { error: error.message }
    }

    // Notify Admin (Conceptual - depends on how admin notifications are handled)
    // For now, we rely on the database entry. If there's an admin user ID, we could send a notification.

    return { success: true }
}

export async function checkHostVerification(userId: string) {
    const supabase = await createClient()
    if (!supabase) return { isValid: false, reasons: ['System error'] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('user_id', userId)
        .single()

    const { data: { user } } = await supabase.auth.admin.getUserById(userId)

    const reasons: string[] = []
    if (!user?.email_confirmed_at) reasons.push('Email not verified')
    if (!profile?.full_name) reasons.push('Name missing')
    if (!profile?.bio || profile.bio.length < 50) reasons.push('Bio too short (min 50 chars)')

    // Check for avatar in profile or user metadata
    const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url
    if (!avatar) reasons.push('Profile photo missing')

    return {
        isValid: reasons.length === 0,
        reasons
    }
}
