import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditEventForm from "./edit-event-form";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) return <div>Backend unavailable</div>;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch Event
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('creator_user_id', user.id) // Ensure ownership
        .single();

    if (!event) notFound();

    // Fetch Studios
    const { data: studios } = await supabase
        .from("studios")
        .select("id, name")
        .eq("owner_user_id", user.id)
        .eq("status", "active");

    return <EditEventForm event={event} studios={studios || []} />;
}
