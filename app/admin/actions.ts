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

export async function requestReportExplanation(reportId: string, targetType: string, targetId: string) {
    const supabase = await createClient();
    if (!supabase) return { error: "Database connection failed" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    let targetUserId = null;
    let contextName = 'your account';

    if (targetType === 'event') {
        const { data } = await supabase.from('events').select('title, creator_user_id').eq('id', targetId).single();
        if (data) { targetUserId = data.creator_user_id; contextName = data.title; }
    } else if (targetType === 'studio') {
        const { data } = await supabase.from('studios').select('name, owner_id').eq('id', targetId).single();
        if (data) { targetUserId = data.owner_id; contextName = data.name; }
    } else if (targetType === 'user') {
        targetUserId = targetId;
    }

    if (!targetUserId) return { error: "Could not identify the user responsible." };
    if (targetUserId === user.id) return { error: "Target is yourself." };

    const { startConversation, sendMessage } = await import('@/app/messages/actions');
    const convResult = await startConversation(targetUserId, 'inquiry', `report_${reportId}`);
    if (convResult.error) return { error: convResult.error };

    const conversationId = convResult.conversationId;
    if (!conversationId) return { error: "Failed to start conversation" };

    // Set report as under investigation
    await supabase.from('reports').update({ status: 'under_investigation' }).eq('id', reportId);

    // Send automated explanation request message
    await sendMessage(
        conversationId,
        `Hello! The Communew Admin team has received a community report regarding: ${contextName}. To ensure a fair review process, we would like to hear your perspective. Please reply to this thread with any context you can provide. Thank you.`
    );

    revalidatePath('/admin');
    return { conversationId };
}
