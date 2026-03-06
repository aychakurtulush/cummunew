"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { startConversation } from "@/app/messages/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContactHostButtonProps {
    hostId: string;
    eventId: string;
}

export function ContactHostButton({ hostId, eventId }: ContactHostButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleContact = async () => {
        setIsLoading(true);
        try {
            const result = await startConversation(hostId, 'event', eventId);
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
        <Button variant="outline" onClick={handleContact} disabled={isLoading} className="text-stone-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Host
        </Button>
    );
}
