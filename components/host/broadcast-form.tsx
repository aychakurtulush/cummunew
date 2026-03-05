"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { sendBroadcastMessage } from "@/app/events/actions";
import { toast } from "sonner";

export function BroadcastForm({ eventId }: { eventId: string }) {
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsPending(true);
        try {
            const result = await sendBroadcastMessage(eventId, message);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Message sent to all attendees!");
                setIsSuccess(true);
                setMessage("");
                setTimeout(() => setIsSuccess(false), 5000);
            }
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                    Message to Attendees
                </label>
                <Textarea
                    placeholder="E.g. Hey everyone! Just a heads up that the entrance is through the side gate..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px] resize-none border-stone-200 focus:ring-moss-500"
                    disabled={isPending}
                />
                <p className="text-xs text-stone-500">
                    This message will be sent via email to all <strong>confirmed</strong> attendees.
                </p>
            </div>

            <Button
                type="submit"
                disabled={isPending || !message.trim()}
                className="w-full sm:w-auto bg-moss-600 hover:bg-moss-700 text-white"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : isSuccess ? (
                    <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Message Sent
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Broadcast
                    </>
                )}
            </Button>
        </form>
    );
}
