"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckInButtonProps {
    bookingId: string;
    initialCheckedIn: boolean;
}

export function CheckInButton({ bookingId, initialCheckedIn }: CheckInButtonProps) {
    const [loading, setLoading] = useState(false);
    const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
    const supabase = createClient();
    const router = useRouter();

    const handleCheckIn = async () => {
        if (checkedIn) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({
                    checked_in: true,
                    checked_in_at: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) throw error;

            setCheckedIn(true);
            toast.success("Guest checked in successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to check in guest");
        } finally {
            setLoading(false);
        }
    };

    if (checkedIn) {
        return (
            <div className="flex items-center gap-1.5 text-moss-600 font-medium text-sm py-2 px-3 bg-moss-50 rounded-lg border border-moss-100">
                <CheckCircle2 className="h-4 w-4" />
                Checked In
            </div>
        );
    }

    return (
        <Button
            size="sm"
            onClick={handleCheckIn}
            disabled={loading}
            className="bg-stone-900 hover:bg-stone-800 text-white"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Check In
        </Button>
    );
}
