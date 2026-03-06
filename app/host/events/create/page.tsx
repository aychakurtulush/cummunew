import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateEventForm from "./create-event-form";
import { Suspense } from "react";

export default async function CreateEventPage({
    searchParams,
}: {
    searchParams: Promise<{ studio_id?: string; start_time?: string; end_time?: string; studio_booking_id?: string }>
}) {
    const supabase = await createClient();
    const { studio_id, start_time, end_time, studio_booking_id } = await searchParams;

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

        if (!exists) {
            const { data: bookedStudio } = await supabase
                .from("studios")
                .select("id, name")
                .eq("id", studio_id)
                .single();

            if (bookedStudio) {
                allStudios = [...allStudios, bookedStudio];
            }
        }
    }

    return (
        <Suspense fallback={<div className="max-w-2xl mx-auto py-12 text-center">Loading form...</div>}>
            <CreateEventForm
                studios={allStudios}
                initialStartTime={start_time}
                initialEndTime={end_time}
                initialStudioId={studio_id}
                initialStudioBookingId={studio_booking_id}
            />

        </Suspense>
    );
}
