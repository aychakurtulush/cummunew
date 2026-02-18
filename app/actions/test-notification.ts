'use server'

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"

export async function sendTestNotification() {
    const supabase = await createClient()
    if (!supabase) return { error: "Client init failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Use standard client (RLS fix applied)
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: user.id,
            type: 'system',
            title: 'Test Notification 🔔',
            message: 'This is a test notification using standard client (RLS Fixed).',
            link: null,
            is_read: false
        })

    if (error) {
        console.error('[Debug] Notification insert failed:', error)
        return { error: `Insert failed: ${error.message}` }
    }

    return { success: true }
}
