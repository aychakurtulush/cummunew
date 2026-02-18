import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateEventForm from "./create-event-form";

export default async function CreateEventPage({
    searchParams,
}: {
    searchParams: Promise<{ studio_id?: string; start_time?: string; end_time?: string }>
}) {
    const supabase = await createClient();
    const { studio_id, start_time, end_time } = await searchParams;

    if (!supabase) {
        return <div>Database connection error</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's studios
    const { data: myStudios } = await supabase
        .from("studios")
        .select("id, name")
        .eq("owner_user_id", user.id)
        .eq("status", "active");

    let allStudios = myStudios || [];

    // If studio_id is provided (e.g. converting a booking), fetch that studio too
    if (studio_id) {
        // Check if it's already in the list
        const exists = allStudios.find(s => s.id === studio_id);

        // If not in the list (e.g. someone else's studio currently booked by me?), fetch it
        // Note: For now, assuming host can only create events in their own studios or generic locations
        // But if the use case is "turn a booking into an event", we might want to fetch that specific studio details
        if (!exists) {
            const { data: bookedStudio } = await supabase
                .from("studios")
                .select("id, name")
                .eq("id", studio_id)
                .single();

            if (bookedStudio) {
                // Determine if we should add it. This depends on business logic. 
                // For now, let's add it so it appears in the dropdown as the selected option.
                allStudios = [...allStudios, bookedStudio];
            }
        }
    }

    return (
        <CreateEventForm
            studios={allStudios}
            initialStartTime={start_time}
            initialEndTime={end_time}
        />
    );
}
