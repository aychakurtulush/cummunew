"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RealtimeListener() {
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Get current user ID
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, [supabase]);

    useEffect(() => {
        if (!userId) return;

        // console.log("Setting up realtime listeners for user:", userId);

        const channel = supabase.channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_user_id=neq.${userId}` // Don't notify for own messages (though filter helps, logic safer)
                    // RLS usually filters rows we can see. 
                    // For messages, we see if we are sender or receiver.
                    // Filter `sender_user_id=neq.${userId}` ensures we only see incoming.
                },
                async (payload) => {
                    // Verify we are the recipient (Client-side check as extra safety if RLS is broad)
                    // Actually, we can't easily check recipient_id on the message row safely without joining conversation.
                    // BUT, RLS policy for 'SELECT' usually allows seeing messages where we are participant.
                    // However, 'postgres_changes' payload contains the NEW row.
                    // If we receive the payload, it means RLS allowed us to see it.
                    // We just need to ensure we didn't send it. The filter `sender_user_id=neq.${userId}` handles that.

                    // Ideally we want to know WHO sent it, but payload only has sender_user_id.
                    // For MVP 1-line notification, "New Message" is enough.

                    // console.log("New message received:", payload);
                    toast("New Message Received 💬", {
                        description: "Click to view conversation",
                        action: {
                            label: "View",
                            onClick: () => router.push(`/messages/${payload.new.conversation_id}`)
                        },
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'studio_inquiries',
                    filter: `requester_id=eq.${userId}` // Only updates where I am the requester
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    const oldStatus = payload.old.status;

                    if (newStatus !== oldStatus) {
                        const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                        const isApproved = newStatus === 'approved';

                        toast(`Request ${statusLabel}`, {
                            description: isApproved
                                ? "Your booking request was approved! 🎉"
                                : "Your booking request was declined.",
                            action: {
                                label: "View",
                                onClick: () => router.push('/bookings')
                            },
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase, router]);

    return null; // Headless component
}
