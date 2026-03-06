"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { startConversation } from "@/app/messages/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContactAttendeeButtonProps {
    attendeeId: string;
    eventId: string;
}

export function ContactAttendeeButton({ attendeeId, eventId }: ContactAttendeeButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleContact = async () => {
        setIsLoading(true);
        try {
            const result = await startConversation(attendeeId, 'event', eventId);
            if (result.error) {
                toast.error(result.error);
            } else if (result.conversationId) {
                router.push(`/messages/${result.conversationId}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Message Attendee"
            onClick={handleContact}
            disabled={isLoading}
        >
            <Mail className="h-4 w-4 text-stone-400 hover:text-stone-600" />
        </Button>
    );
}
