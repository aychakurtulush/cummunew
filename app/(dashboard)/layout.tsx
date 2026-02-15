import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardSideNav } from "./components/dashboard-side-nav";

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
                        <DashboardSideNav />

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
