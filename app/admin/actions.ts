'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveReport(reportId: string, notes: string, enforcement: 'none' | 'warning' | 'suspension' | 'ban') {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Update report
    const { error } = await supabase
        .from('reports')
        .update({
            status: 'resolved',
            admin_notes: notes,
            enforcement_level: enforcement
        })
        .eq('id', reportId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function applyUserPenalty(userId: string, type: 'warning' | 'suspension' | 'ban', reason: string, durationDays?: number) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    let updateData: any = {
        suspension_reason: reason
    }

    if (type === 'ban') {
        updateData.is_banned = true
    } else if (type === 'suspension' && durationDays) {
        const until = new Date()
        until.setDate(until.getDate() + durationDays)
        updateData.is_suspended_until = until.toISOString()
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)

    if (error) return { error: error.message }

    // Notify user
    try {
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'account_alert',
                title: `Account Action: ${type.toUpperCase()}`,
                message: `An admin has applied a ${type} to your account. Reason: ${reason}`
            })
    } catch (e) {
        console.error('Penalty notification failed:', e)
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function toggleHostFlag(userId: string, flagged: boolean, reason?: string) {
    const supabase = await createClient()
    if (!supabase) return { error: "Database connection failed" }

    const { error } = await supabase
        .from('profiles')
        .update({
            admin_flagged: flagged,
            admin_flagged_reason: flagged ? (reason || 'Admin Review Required') : null
        })
        .eq('user_id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}
