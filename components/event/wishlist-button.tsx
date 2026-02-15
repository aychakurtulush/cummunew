'use client';

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/app/events/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WishlistButtonProps {
    eventId: string;
    initialIsLiked: boolean;
    className?: string;
    variant?: "icon" | "full";
}

export function WishlistButton({ eventId, initialIsLiked, className, variant = "icon" }: WishlistButtonProps) {
    // console.log(`[WishlistButton] Render ${eventId}, initialIsLiked:`, initialIsLiked);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Sync state with server prop to fix "amnesia" on revalidation
    useEffect(() => {
        setIsLiked(initialIsLiked);
    }, [initialIsLiked]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setIsLoading(true);


        try {
            const result = await toggleWishlist(eventId);
            if (result.error) {
                // Revert on error (e.g. not logged in)
                setIsLiked(isLiked);
                if (result.error === "Not authenticated") {
                    toast.error("Please log in to save events");
                    router.push(`/login?next=/events/${eventId}`);
                } else {
                    toast.error("Failed to update wishlist");
                }
            } else if (result.success) {
                setIsLiked(result.isLiked!);
                toast.success(result.isLiked ? "Added to wishlist" : "Removed from wishlist");
                router.refresh();
            }
        } catch (error) {
            setIsLiked(isLiked);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "full") {
        return (
            <Button
                variant="outline"
                className={`w-full gap-2 transition-all ${isLiked ? "text-red-600 border-red-100 bg-red-50 hover:bg-red-100" : "text-stone-600"} ${className}`}
                onClick={handleToggle}
                disabled={isLoading}
            >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Saved to Wishlist" : "Save to Wishlist"}
            </Button>
        );
    }

    return (
        <Button
            size="icon"
            variant="secondary"
            className={`h-9 w-9 rounded-full bg-white/90 shadow-sm transition-all hover:scale-110 active:scale-95 ${isLiked ? "text-red-500 hover:text-red-600" : "text-stone-400 hover:text-stone-600"} ${className}`}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        </Button>
    );
}
