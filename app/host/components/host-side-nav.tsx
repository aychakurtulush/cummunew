"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    DollarSign,
    Users,
    Settings,
    PlusCircle,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const HOST_SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/host" },
    { icon: Calendar, label: "Manage Events", href: "/host/events" },
    { icon: Users, label: "Attendees", href: "/host/attendees" },
    { icon: DollarSign, label: "Earnings", href: "/host/earnings" },
    { icon: Settings, label: "Settings", href: "/host/settings" },
];

export function HostSideNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/host") {
            return pathname === "/host";
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
            <div className="mb-6 px-2">
                <Link href="/host/events/create">
                    <Button className="w-full bg-moss-600 hover:bg-moss-700 text-white gap-2 shadow-sm">
                        <PlusCircle className="h-4 w-4" />
                        Create Event
                    </Button>
                </Link>
            </div>

            <nav className="space-y-1">
                {HOST_SIDEBAR_ITEMS.map((item) => {
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

            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                <User className="h-4 w-4" />
                Switch to User View
            </Link>
        </div>
    );
}
