import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Mock Data for Demo
const MOCK_SAVED = [
    {
        id: "demo-1",
        title: "Intro to Wheel Throwing",
        host: "Clay Space Berlin",
        category: "Arts",
        start_time: new Date(Date.now() + 86400000).toISOString(),
        price: 45,
        city: "Kreuzberg",
        imagePart: "Hands molding clay",
        tags: ["Workshop"],
    },
    {
        id: "demo-3",
        title: "Morning Flow Yoga",
        host: "Urban Zen",
        category: "Sports",
        start_time: new Date(Date.now() + 259200000).toISOString(),
        price: 15,
        city: "Tempelhof",
        imagePart: "Yoga in park",
        tags: ["Outdoor"],
    },
];

const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

export default async function SavedPage() {
    const supabase = await createClient();
    let savedEvents = [];

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect('/login');
        // In a real app, we would fetch from a 'saved_events' table here
        // For now, we will just use the mock data even if logged in, as migration for 'saved' isn't applied yet
        savedEvents = MOCK_SAVED;
    } else {
        savedEvents = MOCK_SAVED;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-stone-900">Saved Events</h1>
                <p className="text-stone-500 text-sm">Events you are interested in.</p>
            </div>

            {!supabase && (
                <div className="text-xs text-stone-400 text-center uppercase tracking-widest mb-4">Demo Mode - Mock Data</div>
            )}

            {savedEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {savedEvents.map((event: any) => (
                        <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                            <article className="flex flex-col h-full bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-all">
                                <div className="aspect-[4/3] w-full bg-stone-200 relative">
                                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-sm font-medium">
                                        [{event.category}]
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 text-red-500 hover:text-red-600 hover:bg-white">
                                            <Heart className="h-4 w-4 fill-current" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold uppercase tracking-wider text-moss-700 flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(event.start_time)}
                                        </span>
                                        <span className="font-bold text-stone-900">€{event.price}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-stone-900 leading-tight line-clamp-2">
                                        {event.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-stone-500">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span className="truncate">{event.city}</span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    <h3 className="text-lg font-medium text-stone-900 mb-1">No saved events</h3>
                    <Link href="/">
                        <Button variant="link">Explore Events</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
