import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateEventForm from "./create-event-form";

export default async function CreateEventPage() {
    const supabase = await createClient();

    if (!supabase) {
        return <div>Database connection error</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's studios
    const { data: studios } = await supabase
        .from("studios")
        .select("id, name")
        .eq("owner_user_id", user.id)
        .eq("status", "active");

    return <CreateEventForm studios={studios || []} />;
}
