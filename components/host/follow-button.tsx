"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toggleFollow } from "@/app/events/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
    hostId: string;
    initialIsFollowing: boolean;
    hasAuth: boolean;
    className?: string;
}

export function FollowButton({ hostId, initialIsFollowing, hasAuth, className }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        if (!hasAuth) {
            toast.error("Please login to follow hosts");
            router.push("/login");
            return;
        }

        setIsPending(true);
        try {
            const result = await toggleFollow(hostId);
            if (result.error) {
                toast.error(result.error);
            } else {
                setIsFollowing(result.isFollowing ?? false);
                toast.success(result.isFollowing ? "Following host!" : "Unfollowed host");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            onClick={handleToggle}
            disabled={isPending}
            className={`rounded-full px-8 h-12 shadow-lg transition-all ${isFollowing
                    ? "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 shadow-none"
                    : "bg-moss-600 hover:bg-moss-700 text-white shadow-moss-900/20"
                } ${className}`}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isFollowing ? (
                <UserMinus className="h-4 w-4 mr-2" />
            ) : (
                <UserPlus className="h-4 w-4 mr-2" />
            )}
            {isFollowing ? "Unfollow" : "Follow Host"}
        </Button>
    );
}
