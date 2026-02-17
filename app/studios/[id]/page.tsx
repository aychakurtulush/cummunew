import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Adjusted imports
import { MapPin, Globe, Users, Coins, Image as ImageIcon, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StudioActions } from "@/components/studio/studio-actions";

async function getStudio(id: string) {
    const supabase = await createClient();

    if (!supabase) return null;

    const { data: studio, error } = await supabase
        .from('studios')
        .select('*')
        .eq('id', id)
        .single();

    if (!studio || error) return null;

    // Fetch studio events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('studio_id', id)
        .eq('status', 'approved');

    // Check if current user is owner
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === studio.owner_user_id;

    return {
        ...studio,
        upcomingEvents: events || [],
        isOwner
    };
}

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const studio = await getStudio(id);

    if (!studio) {
        return notFound();
    }

    const coverImage = studio.images?.[0];

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Cover Image */}
                <div className="h-64 md:h-96 w-full bg-stone-200 relative overflow-hidden group">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt={studio.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                            <span className="font-medium">No Cover Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-12">
                    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-6 md:p-8 flex flex-col gap-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                            {/* Avatar */}
                            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white shadow-lg -mt-16 bg-stone-100 shrink-0">
                                <AvatarImage src={studio.avatar_url} />
                                <AvatarFallback className="text-3xl bg-moss-50 text-moss-700 font-serif">
                                    {studio.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Title & Actions */}
                            <div className="flex-1 w-full pt-2">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
                                            {studio.name}
                                        </h1>
                                        <div className="flex items-center gap-4 text-stone-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 text-moss-600" />
                                                <span>{studio.location || "Berlin"}</span>
                                            </div>
                                            {studio.capacity && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4 text-moss-600" />
                                                    <span>Up to {studio.capacity} (standing)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <StudioActions
                                        studioId={studio.id}
                                        studioName={studio.name}
                                        isOwner={studio.isOwner}
                                        ownerId={studio.owner_user_id}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Column: Description & Amenities */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold text-stone-900 font-serif">About the Space</h2>
                                    <p className="text-stone-600 leading-relaxed text-lg">
                                        {studio.description || "No description provided."}
                                    </p>
                                </section>

                                {studio.amenities && studio.amenities.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold text-stone-900 font-serif">Amenities</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {studio.amenities.map((amenity: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 bg-stone-100 text-stone-700 hover:bg-stone-200">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Right Column: Pricing & Info */}
                            <div className="space-y-6">
                                <div className="bg-stone-50 rounded-xl p-6 space-y-4 border border-stone-100">
                                    <h3 className="font-semibold text-stone-900">Rental Rates</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-stone-900">€{studio.price_per_hour}</span>
                                        <span className="text-stone-500">/ hour</span>
                                    </div>
                                    <div className="text-sm text-stone-500 space-y-2">
                                        <p>• Minimum 2 hours booking</p>
                                        <p>• Cleaning fee included</p>
                                    </div>
                                </div>

                                {studio.website && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <Globe className="h-4 w-4" />
                                        <a href={studio.website} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-moss-700 truncate">
                                            {studio.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Events Section */}
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-serif font-bold text-stone-900">Upcoming Events</h2>
                            {/* <Button variant="ghost" className="text-moss-700">View All</Button> */}
                        </div>

                        {studio.upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {studio.upcomingEvents.map((event: any) => (
                                    <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                                        <Card className="h-full cursor-pointer overflow-hidden border-stone-200 bg-white hover:border-moss-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                            <div className="aspect-[3/2] w-full bg-stone-200 relative overflow-hidden">
                                                {event.image_url ? (
                                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 bg-stone-100">
                                                        Event
                                                    </div>
                                                )}
                                                <Badge className="absolute top-3 left-3 bg-white/90 text-stone-900 shadow-sm backdrop-blur">{event.category || 'Event'}</Badge>
                                            </div>
                                            <CardHeader className="p-4 flex-grow">
                                                <span className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                                                    {new Date(event.start_time).toLocaleDateString()}
                                                </span>
                                                <CardTitle className="text-base leading-tight group-hover:text-moss-700 transition-colors line-clamp-2">
                                                    {event.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardFooter className="p-4 pt-0 text-stone-500 text-sm">
                                                From €{event.price}
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-dashed border-stone-200 p-12 text-center text-stone-500">
                                <CalendarPlus className="h-10 w-10 mx-auto mb-4 text-stone-300" />
                                <p>No events scheduled at this studio yet.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
