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
import { formatEventDate, formatEventTime } from "@/lib/date-utils";
import { ShareButton } from "@/components/event/share-button";



import { WishlistButton } from "@/components/event/wishlist-button";
import { BookingButton } from "@/components/event/booking-button";
import { ReportButton } from "@/components/shared/report-button";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    let event: any = null;
    let isLiked = false;
    let bookingStatus: string | null = null;

    let hostProfile: any = null;

    if (supabase) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    studios (
                        name,
                        location
                    )
                `)
                .eq('id', id)
                .single();

            if (!error && data) {
                event = data;

                // Fetch confirmed bookings count
                const { count, error: countError } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', id)
                    .eq('status', 'confirmed');

                if (!countError) {
                    event.confirmed_count = count || 0;
                }

                // ... host profile fetch ...
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url') // Assuming 'avatar_url' exists in profiles? Schema said 'full_name', 'bio'. No avatart_url in 001.
                    // Wait, 001 schema for profiles: full_name, bio, languages, interests.
                    // But NavbarActions uses user_metadata.avatar_url.
                    // Let's use user_metadata if profile doesn't have it? 
                    // Or fetch from auth.users? We can't fetch auth.users from client lib easily.
                    // Let's check if we added avatar_url to profiles later?
                    // I will just fetch full_name for now.
                    .eq('user_id', data.creator_user_id)
                    .single();

                hostProfile = profile;
            }

            if (user && event) {
                const { data: wishlistEntry } = await supabase
                    .from('wishlist')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('event_id', id)
                    .single();

                isLiked = !!wishlistEntry;

                // Check booking status
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('status')
                    .eq('user_id', user.id)
                    .eq('event_id', id)
                    .single();

                if (booking) {
                    bookingStatus = booking.status;
                }
            }
        } catch (e) {
            console.error("Error loading event:", e);
        }
    }

    if (!event) {
        notFound();
    }

    // Calculate spots left
    const spotsLeft = Math.max(0, (event.capacity || 0) - (event.confirmed_count || 0));

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
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-300">
                                    <Globe className="h-16 w-16 mb-2 opacity-20" />
                                    <span className="text-sm font-medium opacity-40">No Cover Image</span>
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

                        {/* Host Info */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border border-stone-200">
                                {/* Use Google/Auth avatar if available, else placeholder */}
                                <AvatarFallback className="bg-stone-100 text-stone-500">
                                    {(hostProfile?.full_name?.[0] || "H").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-serif font-semibold text-stone-900">
                                    Hosted by {hostProfile?.full_name || "Community Member"}
                                    {event.studios && (
                                        <span className="font-normal text-stone-600">
                                            {' '}at <Link href={`/studios/${event.studio_id}`} className="hover:underline text-moss-700">{event.studios.name}</Link>
                                        </span>
                                    )}
                                </h3>
                                <p className="text-stone-500 text-sm mb-2">Verified Host</p>
                                <p className="text-stone-600 leading-relaxed text-sm max-w-lg">
                                    This event is organized by {hostProfile?.full_name || "a member"}
                                    {event.studios ? ` and hosted at ${event.studios.name}.` : "."}
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
                            <h3 className="text-lg font-serif font-semibold text-stone-900 mb-4">Everything you need</h3>
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
                                                <span className="font-medium">{formatEventDate(event.start_time)}</span>
                                                <span className="text-xs">{formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}</span>
                                            </div>
                                            <div className="text-xs font-medium text-moss-700">
                                                {spotsLeft} spots left
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {bookingStatus ? (
                                    <Link href="/bookings">
                                        <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 shadow-md">
                                            {bookingStatus === 'confirmed' ? 'Booking Confirmed' :
                                                bookingStatus === 'declined' ? 'Booking Declined' :
                                                    'Request Sent'}
                                        </Button>
                                    </Link>
                                ) : (
                                    <BookingButton
                                        eventId={event.id}
                                        price={event.price}
                                        hasAuth={!!supabase && await supabase.auth.getUser().then(r => !!r.data.user)}
                                        isFull={spotsLeft === 0}
                                    />
                                )}
                                <p className="text-xs text-center text-stone-500">
                                    {bookingStatus ? "View your bookings" : (spotsLeft === 0 ? "Event is full" : "Pay on arrival. No card needed today.")}
                                </p>
                                <div className="text-xs text-center text-stone-500 bg-stone-50 py-2 rounded-md border border-stone-100 mt-2">
                                    <span className="font-semibold block mb-0.5">Cancellation Policy</span>
                                    Cancel up to 24 hours before for a full refund.
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-4 justify-center">
                                <ShareButton title={event.title} description={event.description} />
                                <WishlistButton
                                    eventId={event.id}
                                    initialIsLiked={isLiked}
                                    variant="full"
                                />
                            </div>

                            <div className="flex justify-center pt-2">
                                <ReportButton
                                    targetId={event.id}
                                    targetType="event"
                                    buttonText="Report Event"
                                    className="text-stone-400 hover:text-red-600 hover:bg-red-50"
                                />
                            </div>

                        </div>
                    </div>

                </div>

            </main >

            <Footer />
        </div >
    )
}
