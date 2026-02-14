import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    LayoutDashboard,
    Calendar,
    DollarSign,
    Users,
    Settings,
    PlusCircle,
    LogOut,
} from "lucide-react";
import Link from "next/link";

const HOST_SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/host" },
    { icon: Calendar, label: "Manage Events", href: "/host/events" },
    { icon: Users, label: "Attendees", href: "/host/attendees" },
    { icon: DollarSign, label: "Earnings", href: "/host/earnings" },
    { icon: Settings, label: "Settings", href: "/host/settings" },
];

export default function HostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <div className="bg-moss-900 py-3 text-center text-xs font-medium text-moss-100 uppercase tracking-widest">
                Host View
            </div>

            <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="hidden md:block col-span-1 space-y-6">
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
                                {HOST_SIDEBAR_ITEMS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            <Separator className="my-4" />

                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                                Switch to User View
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="md:col-span-3 lg:col-span-4 min-h-[500px]">
                        {children}
                    </main>

                </div>
            </div>

            <Footer />
        </div>
    );
}
