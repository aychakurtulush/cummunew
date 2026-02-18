'use server'

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"

export async function sendTestNotification() {
    const supabase = await createClient()
    if (!supabase) return { error: "Client init failed" }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    try {
        const adminSupabase = createServiceRoleClient()

        const { error } = await adminSupabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type: 'system',
                title: 'Test Notification 🔔',
                message: 'This is a test notification to verify the system works.',
                link: null,
                is_read: false
            })

        if (error) {
            console.error('[Debug] Notification insert failed:', error)
            return { error: `Insert failed: ${error.message}` }
        }

        return { success: true }
    } catch (e: any) {
        console.error('[Debug] Service Role Client failed:', e)
        if (e.message?.includes('Missing Supabase environment variables')) {
            return { error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing in env variables." }
        }
        return { error: `Server Error: ${e.message}` }
    }
}
