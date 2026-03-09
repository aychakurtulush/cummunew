'use server'

import { createServiceRoleClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteAccountAction() {
    const supabase = await createClient()
    if (!supabase) return { error: 'Database configuration error' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    try {
        const adminClient = createServiceRoleClient()
        // Delete the user using the admin client
        const { error } = await adminClient.auth.admin.deleteUser(user.id)

        if (error) {
            console.error("Error deleting user account via Admin API:", error)
            return { error: 'Failed to delete account. Please try again later.' }
        }

        // Sign out the current session
        await supabase.auth.signOut()

    } catch (e: any) {
        console.error("Critical error in deleteAccountAction:", e)
        return { error: 'An unexpected error occurred.' }
    }

    redirect('/?deleted=true')
}
