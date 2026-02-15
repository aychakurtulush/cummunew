"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { signout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

interface NavbarActionsProps {
    user: any; // Using any for Supabase user object to avoid complex type imports for now
}

export function NavbarActions({ user }: NavbarActionsProps) {
    const pathname = usePathname();

    const isHostActive = pathname.startsWith("/host");
    const isDashboardActive = pathname === "/dashboard" || (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/"));
    // Note: Dashboard usually has sub-routes like /dashboard/bookings, but standard /dashboard is the overview.
    // However, sidebar logic uses .startsWith. Let's stick to simple .startsWith for "Dashboard" 
    // but we need to be careful not to conflict if we had /dashboard-something (unlikely).
    // Actually, for the top nav, "Dashboard" usually implies the user area.
    // Let's us startsWith("/dashboard") for simple matching.

    const isDashboardSection = pathname.startsWith("/dashboard") || pathname.startsWith("/bookings") || pathname.startsWith("/saved") || pathname.startsWith("/messages") || pathname.startsWith("/profile") || pathname.startsWith("/settings");

    return (
        <div className="flex items-center gap-2 md:gap-4">
            <Link href="/host">
                <Button
                    variant="ghost"
                    className={cn(
                        "hidden lg:inline-flex transition-colors",
                        isHostActive
                            ? "bg-moss-50 text-moss-700 font-semibold hover:bg-moss-100 hover:text-moss-800"
                            : "text-stone-600 hover:text-moss-700 hover:bg-stone-50"
                    )}
                >
                    Host Dashboard
                </Button>
            </Link>
            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            {user ? (
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden xl:block text-sm text-stone-600">
                        Welcome, <span className="font-semibold text-stone-900">{user.user_metadata?.full_name?.split(' ')[0] || "there"}!</span>
                    </div>
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "gap-2 transition-colors",
                                isDashboardSection
                                    ? "bg-stone-100 text-stone-900 font-semibold hover:bg-stone-200"
                                    : "font-medium text-stone-900 hover:bg-stone-50"
                            )}
                        >
                            <User className="h-4 w-4" />
                            <span className="hidden lg:inline">Dashboard</span>
                        </Button>
                    </Link>
                    <form action={signout}>
                        <Button size="sm" variant="outline" className="text-stone-600 border-stone-300 hover:bg-stone-50">
                            Sign out
                        </Button>
                    </form>
                </div>
            ) : (
                <>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="font-medium text-stone-900">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button size="sm" className="bg-moss-600 hover:bg-moss-700 text-white rounded-full px-5">
                            Sign up
                        </Button>
                    </Link>
                </>
            )}
        </div>
    );
}
