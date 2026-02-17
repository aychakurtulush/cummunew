"use client";

import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface StudioActionsProps {
    studioId: string;
    studioName: string;
    isOwner?: boolean;
}

export function StudioActions({ studioId, studioName, isOwner }: StudioActionsProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    import { useEffect } from "react";
    import { toggleStudioFollow, getIsFollowing } from "@/app/studios/actions";

    useEffect(() => {
        if (!isOwner) {
            getIsFollowing(studioId).then(setIsFollowing).finally(() => setIsLoading(false));
        }
    }, [studioId, isOwner]);

    const handleRequest = () => {
        // TODO: Implement actual request flow
        toast.info("Request feature coming soon!", {
            description: "You'll be able to request to host events here."
        });
    };

    const handleFollow = async () => {
        // Optimistic update
        const newState = !isFollowing;
        setIsFollowing(newState);

        try {
            const result = await toggleStudioFollow(studioId);
            // Verify state matches server
            if (result.isFollowing !== newState) {
                setIsFollowing(result.isFollowing);
            }
            toast.success(result.isFollowing ? `Following ${studioName}` : `Unfollowed ${studioName}`);
        } catch (error) {
            setIsFollowing(!newState); // Revert on error
            toast.error("Failed to update follow status");
        }
    };

    const handleContact = () => {
        toast.info("Chat feature coming soon!");
    }

    if (isOwner) {
        return (
            <Button variant="outline" className="w-full sm:w-auto">
                Edit Studio
            </Button>
        )
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handleFollow}
                disabled={isLoading}
                className={isFollowing ? "text-red-500 hover:text-red-600 border-red-200 bg-red-50" : "text-stone-600"}
            >
                <Heart className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" onClick={handleContact}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
            </Button>
            <Button onClick={handleRequest} className="bg-moss-700 hover:bg-moss-800 text-white">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Request to Host
            </Button>
        </div>
    );
}
