import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    LayoutDashboard,
    CalendarDays,
    Heart,
    MessageSquare,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import Link from "next/link";

const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: CalendarDays, label: "My Bookings", href: "/bookings" },
    { icon: Heart, label: "Saved Events", href: "/saved" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="hidden md:block col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                            <nav className="space-y-1">
                                {SIDEBAR_ITEMS.map((item) => (
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
                            <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>

                        {/* Promo / Upgrade */}
                        <div className="bg-moss-50 rounded-xl p-4 border border-moss-100">
                            <h3 className="font-serif font-bold text-moss-800 mb-1">Become a Host</h3>
                            <p className="text-xs text-moss-700 mb-3">Share your passion and earn money.</p>
                            <Link href="/host">
                                <Button size="sm" className="w-full bg-moss-600 hover:bg-moss-700 text-white shadow-sm">
                                    Start Hosting
                                </Button>
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
