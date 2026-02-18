'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { bookEvent } from "@/app/events/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BookingButtonProps {
    eventId: string;
    price: number;
    hasAuth: boolean;
    isFull?: boolean;
}

export function BookingButton({ eventId, price, hasAuth, isFull = false }: BookingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleBooking = async () => {
        if (isFull) return;

        if (!hasAuth) {
            toast.error("Please log in to book events");
            router.push(`/login?next=/events/${eventId}`);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('eventId', eventId);

            const result = await bookEvent(formData);

            if (result.error) {
                if (result.error === "Not authenticated") {
                    toast.error("Please log in to book events");
                    router.push(`/login?next=/events/${eventId}`);
                } else {
                    toast.error(`Booking Failed: ${result.error}`);
                }
            } else if (result.success) {
                toast.success("Request sent! Redirecting...");
                router.refresh();
                router.push('/bookings');
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleBooking}
            disabled={isLoading || isFull}
            className={`w-full h-12 text-base shadow-md transition-all ${isFull
                    ? "bg-stone-300 hover:bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-moss-600 hover:bg-moss-700"
                }`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : isFull ? (
                "Event Full"
            ) : (
                "Request to Book"
            )}
        </Button>
    );
}
