"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarDays,
    Heart,
    MessageSquare,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { signout } from "@/app/(auth)/actions";

const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: CalendarDays, label: "My Bookings", href: "/bookings" },
    { icon: Heart, label: "Saved Events", href: "/saved" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function DashboardSideNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
            <nav className="space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                active
                                    ? "bg-stone-100 text-stone-900"
                                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", active ? "text-stone-900" : "text-stone-500")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <Separator className="my-4" />
            <form action={signout}>
                <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Log out
                </button>
            </form>
        </div>
    );
}
