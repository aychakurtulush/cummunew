'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/app/events/actions";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CancelBookingButtonProps {
    bookingId: string;
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this request?")) return;

        setIsLoading(true);
        try {
            const result = await cancelBooking(bookingId);
            if (result.success) {
                toast.success("Request cancelled");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to cancel");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="text-stone-400 hover:text-red-600 hover:bg-red-50"
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Request"}
        </Button>
    );
}
