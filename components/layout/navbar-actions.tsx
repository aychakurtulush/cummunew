"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { signout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-9 w-9 border border-stone-200">
                                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || "User"} />
                                    <AvatarFallback className="bg-stone-100 text-stone-600 font-medium">
                                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "Commun Member"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <Link href="/dashboard">
                                    <DropdownMenuItem className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link href="/host">
                                    <DropdownMenuItem className="cursor-pointer lg:hidden">
                                        <span>Host Dashboard</span>
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <form action={signout} className="w-full">
                                    <button type="submit" className="flex w-full items-center text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
