'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinWaitlist, leaveWaitlist } from "@/app/events/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Bell, BellOff } from "lucide-react";

interface WaitlistButtonProps {
    eventId: string;
    hasAuth: boolean;
    isOnWaitlist: boolean;
}

export function WaitlistButton({ eventId, hasAuth, isOnWaitlist }: WaitlistButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        if (!hasAuth) {
            toast.error("Please log in to join the waitlist");
            router.push(`/login?next=/events/${eventId}`);
            return;
        }

        setIsLoading(true);

        try {
            if (isOnWaitlist) {
                const result = await leaveWaitlist(eventId);
                if (result.error) throw new Error(result.error);
                toast.success("Removed from waitlist.");
            } else {
                const result = await joinWaitlist(eventId);
                if (result.error) throw new Error(result.error);
                toast.success("Joined waitlist! We'll email you if a spot opens.");
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleToggle}
            disabled={isLoading}
            variant={isOnWaitlist ? "outline" : "default"}
            className={`w-full h-12 text-base shadow-sm transition-all ${isOnWaitlist ? "border-stone-300 text-stone-700 hover:bg-stone-100" : "bg-stone-800 hover:bg-stone-900 text-white"}`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : isOnWaitlist ? (
                <>
                    <BellOff className="mr-2 h-4 w-4" />
                    Leave Waitlist
                </>
            ) : (
                <>
                    <Bell className="mr-2 h-4 w-4" />
                    Join Waitlist
                </>
            )}
        </Button>
    );
}
