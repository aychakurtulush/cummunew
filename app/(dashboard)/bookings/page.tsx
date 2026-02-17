import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelBookingButton } from "@/components/event/cancel-booking-button";

const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

export default async function BookingsPage() {
    const supabase = await createClient();

    if (!supabase) {
        return <div className="p-8 text-center text-stone-500">Backend not configured for bookings.</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch Event Bookings
    const { data: eventBookings } = await supabase
        .from('bookings')
        .select(`
            id,
            status,
            created_at,
            events (
                id,
                title,
                city,
                start_time,
                image_url,
                category
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch Studio Inquiries
    const { data: studioInquiries } = await supabase
        .from('studio_inquiries')
        .select(`
            id,
            status,
            created_at,
            start_time,
            end_time,
            message,
            studio:studios (
                id,
                name,
                location,
                image_url
            )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

    // Combine and Sort
    const allBookings = [
        ...(eventBookings?.map(b => ({ ...b, type: 'event' })) || []),
        ...(studioInquiries?.map(i => ({
            id: i.id,
            status: i.status,
            created_at: i.created_at,
            type: 'studio',
            details: {
                title: i.studio?.name || 'Unknown Studio',
                location: i.studio?.location || 'Unknown Location',
                start_time: i.start_time,
                image_url: i.studio?.image_url, // Might be undefined
                category: 'Studio Rental'
            },
            raw: i
        })) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900">Your Bookings</h1>
                <Link href="/">
                    <Button variant="outline">Browse More Events</Button>
                </Link>
            </div>

            {!allBookings || allBookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
                    <h3 className="text-lg font-medium text-stone-900 mb-2">No bookings yet</h3>
                    <p className="text-stone-500 mb-6">You haven't requested to join any events or studios.</p>
                    <Link href="/">
                        <Button className="bg-moss-600 hover:bg-moss-700">Explore Events</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {allBookings.map((booking: any) => {
                        const isEvent = booking.type === 'event';
                        const title = isEvent ? booking.events.title : booking.details.title;
                        const location = isEvent ? booking.events.city : booking.details.location;
                        const startTime = isEvent ? booking.events.start_time : booking.details.start_time;
                        const imageUrl = isEvent ? booking.events.image_url : booking.details.image_url;
                        const category = isEvent ? booking.events.category : 'Studio';
                        const linkHref = isEvent ? `/events/${booking.events.id}` : `/studios/${booking.raw.studio.id}`;

                        return (
                            <div key={booking.id} className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-sm transition-shadow">
                                {/* Image */}
                                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-xs text-stone-400 font-medium bg-stone-100 p-2 text-center">
                                            [{category}]
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={
                                            booking.status === 'confirmed' || booking.status === 'approved' ? 'default' :
                                                booking.status === 'declined' || booking.status === 'rejected' ? 'destructive' : 'secondary'
                                        } className={
                                            booking.status === 'confirmed' || booking.status === 'approved' ? 'bg-moss-600 hover:bg-moss-700' :
                                                booking.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : ''
                                        }>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </Badge>
                                        <Badge variant="outline" className="text-stone-500 border-stone-200">
                                            {isEvent ? 'Event' : 'Studio'}
                                        </Badge>
                                        <span className="text-xs text-stone-400">Requested {new Date(booking.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-stone-900 mb-1 truncate">{title}</h3>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(startTime)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {location}
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex flex-col items-end gap-2">
                                    <Link href={linkHref}>
                                        <Button variant="ghost" size="sm">View {isEvent ? 'Event' : 'Studio'}</Button>
                                    </Link>
                                    {isEvent && booking.status === 'pending' && (
                                        <CancelBookingButton bookingId={booking.id} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
