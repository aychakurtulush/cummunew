import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WishlistButton } from "@/components/event/wishlist-button";

// Mock Data removed.

const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

export default async function SavedPage() {
    const supabase = await createClient();
    let savedEvents: any[] = [];
    const wishlistEventIds: string[] = [];

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect('/login');

        const { data: wishlistData, error } = await supabase
            .from('wishlist')
            .select(`
                event_id,
                events (*)
            `)
            .eq('user_id', user.id);

        if (!error && wishlistData) {
            savedEvents = wishlistData.map(w => w.events).filter(Boolean);
            wishlistData.forEach(w => wishlistEventIds.push(w.event_id));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-stone-900">Saved Events</h1>
                <p className="text-stone-500 text-sm">Events you are interested in.</p>
            </div>


            {savedEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {savedEvents.map((event: any) => (
                        <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                            <article className="flex flex-col h-full bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-all">
                                <div className="aspect-[4/3] w-full bg-stone-200 relative group-hover:opacity-90 transition-opacity">
                                    {event.image_url ? (
                                        <img
                                            src={event.image_url}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-sm font-medium">
                                            [{event.category}]
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 z-20">
                                        <WishlistButton
                                            eventId={event.id}
                                            initialIsLiked={true}
                                        />
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
