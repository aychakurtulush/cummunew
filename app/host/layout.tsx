import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HostSideNav } from "./components/host-side-nav";

export default async function HostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (!user) {
        redirect("/login");
    }

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
                        <HostSideNav />
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
