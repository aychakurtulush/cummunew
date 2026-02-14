import { bookEvent } from "../actions";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Check, Globe } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/event/share-button";

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

const formatTime = (dateString?: string) => {
    if (!dateString) return "00:00";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { hour: '2-digit', minute: '2-digit' }).format(date);
}

// Mock Data for Demo
const MOCK_EVENTS = [
    {
        id: "demo-1",
        title: "Intro to Wheel Throwing",
        host: "Clay Space Berlin",
        category: "Arts",
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 95400000).toISOString(),
        price: 45,
        city: "Kreuzberg",
        description: "Join us for a 2.5-hour introduction to the pottery wheel. Perfect for beginners.",
        capacity: 8,
        location_type: "studio",
    },
    {
        id: "demo-2",
        title: "Italian Pasta Masterclass",
        host: "Cucina Maria",
        category: "Food",
        start_time: new Date(Date.now() + 172800000).toISOString(),
        end_time: new Date(Date.now() + 183600000).toISOString(),
        price: 65,
        city: "Mitte",
        description: "Learn to make authentic pasta from scratch.",
        capacity: 12,
        location_type: "studio",
    },
    {
        id: "demo-3",
        title: "Morning Flow Yoga",
        host: "Urban Zen",
        category: "Sports",
        start_time: new Date(Date.now() + 259200000).toISOString(),
        end_time: new Date(Date.now() + 262800000).toISOString(),
        price: 15,
        city: "Tempelhof",
        description: "Start your day with a grounding yoga flow in the park.",
        capacity: 20,
        location_type: "partner_venue",
    },
];


export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    let event = null;

    if (id.startsWith('demo-')) {
        event = MOCK_EVENTS.find(e => e.id === id);
    } else if (supabase) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();
            if (!error) event = data;
        } catch (e) {
            // Ignore
        }
    }

    if (!event) {
        notFound();
    }

    // Calculate spots left
    const spotsLeft = event.capacity;

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Breadcrumb / Back */}
                <div className="mb-6">
                    <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                        ← Back to Explore
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Gallery Placeholder */}
                        <div className="aspect-[16/9] w-full bg-stone-200 rounded-2xl overflow-hidden relative group">
                            {event.image_url ? (
                                <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 font-medium">
                                    [{event.category || "Event"} Cover Image]
                                </div>
                            )}
                            <Badge className="absolute top-4 left-4 bg-white/90 text-stone-900 shadow-sm hover:bg-white">{event.category || "General"}</Badge>
                        </div>

                        {/* Header */}
                        <div>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight mb-4">
                                {event.title}
                            </h1>

                            <div className="flex items-center gap-2 text-stone-600">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location_type === 'partner_venue' ? 'Partner Venue' : event.city}, {event.city}</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Host Info (Placeholder) */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border border-stone-200">
                                <AvatarFallback className="bg-stone-100 text-stone-500">H</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-serif font-semibold text-stone-900">Hosted by {event.host || "Community Member"}</h3>
                                <p className="text-stone-500 text-sm mb-2">Verified Host</p>
                                <p className="text-stone-600 leading-relaxed text-sm max-w-lg">
                                    This event is hosted by a passionate member of the Berlin community.
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div className="prose prose-stone max-w-none">
                            <h3 className="text-xl font-serif font-semibold text-stone-900 mb-4">About this event</h3>
                            <div className="whitespace-pre-line text-stone-600 leading-relaxed text-lg">
                                {event.description}
                            </div>
                        </div>

                        {/* Amenities (Hardcoded for MVP) */}
                        <div>
                            <h3 className="text-lg font-serif font-semibold text-stone-900 mb-4">What's included</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-stone-600">
                                    <Check className="h-4 w-4 text-moss-600" />
                                    <span>All materials provided</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-600">
                                    <Check className="h-4 w-4 text-moss-600" />
                                    <span>Guided session</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sticky Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl border border-stone-200 shadow-soft p-6 space-y-6">

                            <div>
                                <span className="text-2xl font-bold text-stone-900">€{event.price}</span>
                                <span className="text-stone-500 text-sm ml-1">per person</span>
                            </div>

                            <div className="space-y-4">
                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-700">Date & Time</label>
                                    <div className="grid gap-2">
                                        <button
                                            className="flex justify-between items-center w-full p-3 rounded-lg border text-sm transition-all border-moss-600 bg-moss-50 ring-2 ring-moss-600 ring-opacity-20"
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{formatDate(event.start_time)}</span>
                                                <span className="text-xs">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                            </div>
                                            <div className="text-xs font-medium text-moss-700">
                                                {spotsLeft} spots left
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <form action={bookEvent}>
                                    <input type="hidden" name="eventId" value={event.id} />
                                    <Button type="submit" disabled={id.startsWith('demo-')} className="w-full h-12 text-base bg-moss-600 hover:bg-moss-700 shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                        {id.startsWith('demo-') ? "Booking Disabled (Demo)" : "Request to Book"}
                                    </Button>
                                </form>
                                <p className="text-xs text-center text-stone-500">
                                    You won't be charged yet.
                                </p>
                            </div>

                            <Separator />

                            <div className="flex gap-4 justify-center">
                                <ShareButton title={event.title} description={event.description} />
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    )
}
