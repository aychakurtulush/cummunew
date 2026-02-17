import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Instagram, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

async function getStudio(id: string) {
    const supabase = await createClient();

    if (!supabase) {
        return null;
    }

    // Attempt to fetch studio
    const { data: studio, error } = await supabase
        .from('studios')
        .select('*')
        .eq('id', id)
        .single();

    if (!studio || error) {
        // Fallback: Check if it's a user profile acting as a studio (simplified logic)
        // For now, if no studio found, return null
        return null;
    }

    // Fetch studio events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('studio_id', id) // Assuming events have studio_id, or we link via creator_user_id
        .eq('status', 'approved');

    return {
        ...studio,
        upcomingEvents: events || []
    };
}

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const studio = await getStudio(id);

    if (!studio) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Cover Image */}
                <div className="h-64 md:h-80 w-full bg-stone-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-medium">
                        [Studio Cover Image]
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">

                        {/* Avatar */}
                        <Avatar className="h-32 w-32 border-4 border-white shadow-md -mt-16 md:-mt-20 bg-stone-100">
                            <AvatarImage src={studio.avatar_url} />
                            <AvatarFallback className="text-3xl">{studio.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-serif font-bold text-stone-900">{studio.name}</h1>
                                    <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{studio.location}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline">Follow</Button>
                                    <Button>Contact</Button>
                                </div>
                            </div>

                            <p className="text-stone-600 max-w-2xl leading-relaxed">
                                {studio.description}
                            </p>

                            <div className="flex gap-6 text-sm">
                                {studio.website && (
                                    <div className="flex items-center gap-2 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors">
                                        <Globe className="h-4 w-4" />
                                        <span className="font-medium underline decoration-stone-300 underline-offset-4">{studio.website}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content Area */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

                    {/* Upcoming Events */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif font-bold text-stone-900">Upcoming Events</h2>
                            <Button variant="link" className="text-moss-600">View Calendar</Button>
                        </div>

                        {studio.upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studio.upcomingEvents.map((event: any) => (
                                    <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                                        <Card className="h-full cursor-pointer overflow-hidden border-stone-200 bg-white hover:border-moss-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                            <div className="aspect-[3/2] w-full bg-stone-200 relative">
                                                <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">
                                                    Event Image
                                                </div>
                                                <Badge className="absolute top-3 left-3 bg-white/90 text-stone-900 shadow-sm">{event.category || 'Event'}</Badge>
                                            </div>
                                            <CardHeader className="p-4 pb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-moss-700">{new Date(event.start_time).toLocaleDateString()}</span>
                                                <CardTitle className="text-lg mt-1">{event.title}</CardTitle>
                                            </CardHeader>
                                            <CardFooter className="p-4 pt-2 border-t border-stone-100 mt-auto">
                                                <span className="font-semibold text-stone-900">€{event.price}</span>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-stone-500 italic">No upcoming events scheduled.</p>
                        )}
                    </section>

                </div>

            </main>
            <Footer />
        </div>
    );
}
