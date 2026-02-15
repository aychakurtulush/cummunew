"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteEvent } from "@/app/events/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteEventMenuItem({ eventId }: { eventId: string }) {
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Optimistic UI could be handled here, but for critical deletes we usually wait
        const result = await deleteEvent(eventId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Event deleted");
            router.refresh();
        }
    };

    return (
        <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            onClick={handleDelete}
        >
            Delete Event
        </DropdownMenuItem>
    );
}
