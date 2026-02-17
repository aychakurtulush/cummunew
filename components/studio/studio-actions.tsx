"use client";

import { Button } from "@/components/ui/button";
import { Heart, CalendarPlus, MessageCircle, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { toggleStudioFollow, getIsFollowing } from "@/app/studios/actions";
import { startConversation } from "@/app/messages/actions";
import { BookingRequestModal } from "./booking-request-modal";
import { useRouter } from "next/navigation";

interface StudioActionsProps {
    studioId: string;
    studioName: string;
    isOwner?: boolean;
    ownerId: string;
    hasAuth: boolean;
}

export function StudioActions({ studioId, studioName, isOwner, ownerId, hasAuth }: StudioActionsProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isOwner && hasAuth) {
            getIsFollowing(studioId).then(setIsFollowing).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [studioId, isOwner, hasAuth]);

    const checkAuth = () => {
        if (!hasAuth) {
            toast.error("Please log in to interact");
            router.push(`/login?next=/studios/${studioId}`);
            return false;
        }
        return true;
    };

    const handleRequest = async () => {
        console.log("Handle Request Clicked");
        if (!checkAuth()) {
            console.log("Auth check failed");
            return;
        }

        if (!ownerId) {
            console.error("Owner ID missing");
            toast.error("Cannot contact owner");
            return;
        }
        console.log("Opening Booking Modal");
        setIsBookingModalOpen(true);
    };

    const handleFollow = async () => {
        if (!checkAuth()) return;

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

    const handleContact = async () => {
        if (!checkAuth()) return;

        if (!ownerId) {
            toast.error("Cannot contact owner");
            return;
        }

        try {
            const result = await startConversation(ownerId);
            if (result.error) {
                toast.error(result.error);
            } else if (result.conversationId) {
                router.push(`/messages/${result.conversationId}`);
            }
        } catch (e) {
            // Check if it's a redirect error (Next.js internals)
            // Just ignore/let it happen if it's a redirect, or log for debug
            // But since we checkedAuth, it should be fine.
            // If startConversation throws a redirect, we might end up here.
            // We can't easily detect Next.js redirect errors in client without importing internal types
            // But valid redirect usually stops execution or throws.
            // For now, assume success or error message.
            console.error(e);
        }
    }

    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const path = window.location.pathname;
        const url = `https://communew.com${path}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: studioName,
                    text: `Check out ${studioName} on Communew`,
                    url: url
                });
            } catch (err) {
                // Ignore cancel
            }
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isOwner) {
        return (
            <div className="flex gap-2">
                <Button variant="outline" className="w-full sm:w-auto">
                    Edit Studio
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="text-stone-600"
            >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={handleFollow}
                disabled={isLoading && hasAuth}
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
