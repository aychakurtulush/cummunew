import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AtmosphereBackground } from "@/components/ui/atmosphere-background";
import { StudioCard } from "@/components/studio/studio-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StudiosPage() {
    const supabase = await createClient();

    // Fetch studios
    // Note: In a real app we would handle pagination and advanced filtering here
    let studios = [];
    if (supabase) {
        const { data, error } = await supabase
            .from('studios')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (!error && data) {
            studios = data;
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative bg-stone-50/50 pt-12 pb-16 border-b border-stone-200 overflow-hidden">
                    <AtmosphereBackground intensity="medium" />
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
                        <div className="space-y-6 max-w-3xl">
                            <Badge variant="outline" className="bg-white/50 backdrop-blur text-stone-600 border-stone-200 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                                Venues & Spaces
                            </Badge>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.05]">
                                Find the perfect space<br className="hidden sm:block" /> for your craft.
                            </h1>
                            <p className="text-stone-600 text-lg sm:text-xl max-w-2xl leading-relaxed">
                                Discover clean, affordable, and inspiring studios in Berlin. From art lofts to yoga shalas, find a place to host your next workshop.
                            </p>

                            <div className="pt-2 flex justify-start">
                                <Link href="/host/studios/create">
                                    <Button className="bg-moss-700 text-white hover:bg-moss-800 rounded-full px-8 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all">
                                        List Your Space
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-serif font-bold text-stone-900">All Studios</h2>
                        <Link href="/host/studios/create">
                            <Button variant="ghost" className="text-moss-700 hover:text-moss-800 hover:bg-moss-50 hidden sm:flex">
                                <Plus className="h-4 w-4 mr-2" /> List a Studio
                            </Button>
                        </Link>
                    </div>

                    {studios.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {studios.map((studio) => (
                                <StudioCard key={studio.id} studio={studio} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="mx-auto w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                                    <Plus className="h-8 w-8 text-stone-400" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900">No studios yet</h3>
                                <p className="text-stone-500">
                                    Be the first to list a space in this community! unique venues are in high demand.
                                </p>
                                <Link href="/host/studios/create">
                                    <Button className="mt-4 bg-moss-600 hover:bg-moss-700 text-white">
                                        List Your Studio
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
