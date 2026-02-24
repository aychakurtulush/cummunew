'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveIban(formData: FormData) {
    const supabase = await createClient();
    if (!supabase) throw new Error("Database unavailable");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const iban = formData.get('iban') as string;

    if (!iban || iban.length < 10) {
        redirect(`/host/settings?error=${encodeURIComponent("Please enter a valid IBAN")}`);
    }

    const { error } = await supabase
        .from('profiles')
        .update({ iban })
        .eq('user_id', user.id);

    if (error) {
        console.error("Error saving IBAN:", error);
        redirect(`/host/settings?error=${encodeURIComponent("Could not save IBAN. Please try again.")}`);
    }

    redirect('/host/settings?success=iban_saved');
}
