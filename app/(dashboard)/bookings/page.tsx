import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";
import { CancelBookingButton } from "@/components/event/cancel-booking-button";
import { CancelInquiryButton } from "./components/cancel-inquiry-button";

export default async function BookingsPage() {
    const supabase = await createClient();
    const t = await getTranslations('bookings');
    const tCommon = await getTranslations('common');

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
                images
            )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

    // Combine and Sort
    const allBookings = [
        ...(eventBookings?.map(b => ({ ...b, type: 'event' })) || []),
        ...(studioInquiries?.map(i => {
            // Handle studio relation potentially returned as array by Supabase types
            const studio = Array.isArray(i.studio) ? i.studio[0] : i.studio;
            // Studio uses 'images' array, Event uses 'image_url' string
            const studioImage = studio?.images?.[0] || null;

            return {
                id: i.id,
                status: i.status,
                created_at: i.created_at,
                type: 'studio',
                details: {
                    title: studio?.name || 'Unknown Studio',
                    location: studio?.location || 'Unknown Location',
                    start_time: i.start_time,
                    image_url: studioImage,
                    category: 'Studio Rental'
                },
                raw: i
            };
        }) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900">{t('title')}</h1>
                <Link href="/">
                    <Button variant="outline">{t('browseMoreEvents')}</Button>
                </Link>
            </div>

            {!allBookings || allBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
                    <div className="h-16 w-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{t('noBookings')}</h3>
                    <p className="text-stone-500 mb-6 max-w-sm text-center">{t('noBookingsSubtitle')}</p>
                    <Link href="/">
                        <Button className="bg-moss-600 hover:bg-moss-700">{t('exploreEvents')}</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {allBookings.map((booking: any) => {
                        const isEvent = booking.type === 'event';
                        const studio = !isEvent ? (Array.isArray(booking.raw.studio) ? booking.raw.studio[0] : booking.raw.studio) : null;

                        const title = isEvent ? booking.events.title : booking.details.title;
                        const location = isEvent ? booking.events.city : booking.details.location;
                        const startTime = isEvent ? booking.events.start_time : booking.details.start_time;
                        const imageUrl = isEvent ? booking.events.image_url : booking.details.image_url;
                        const category = isEvent ? booking.events.category : 'Studio';
                        const linkHref = isEvent ? `/events/${booking.events.id}` : `/studios/${studio?.id}`;

                        return (
                            <div key={booking.id} className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-sm transition-shadow">
                                {/* Image */}
                                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                                    {imageUrl ? (
                                        <Image src={imageUrl} alt="" fill className="object-cover" />
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
                                            booking.checked_in ? 'bg-moss-900 border-moss-700' :
                                                booking.status === 'confirmed' || booking.status === 'approved' ? 'bg-moss-600 hover:bg-moss-700' :
                                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : ''
                                        }>
                                            {booking.checked_in ? 'Attended' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </Badge>
                                        <Badge variant="outline" className="text-stone-500 border-stone-200">
                                            {isEvent ? tCommon('event') : tCommon('studio')}
                                        </Badge>
                                        <span className="text-xs text-stone-400">{t('requested')} {new Date(booking.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-stone-900 mb-1 truncate">{title}</h3>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatEventDate(startTime, 'dd/MM/yyyy, HH:mm')}
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
                                        <Button variant="ghost" size="sm">{isEvent ? t('viewEvent') : t('viewStudio')}</Button>
                                    </Link>

                                    {isEvent && booking.status === 'pending' && (
                                        <CancelBookingButton bookingId={booking.id} />
                                    )}

                                    {!isEvent && (booking.status === 'approved' || booking.status === 'confirmed') && (
                                        <Link href={`/host/events/create?studio_id=${studio?.id}&start_time=${encodeURIComponent(booking.raw.start_time)}&end_time=${encodeURIComponent(booking.raw.end_time)}&studio_booking_id=${booking.id}`}>
                                            <Button size="sm" className="bg-moss-600 hover:bg-moss-700 text-white">
                                                Create Event
                                            </Button>
                                        </Link>
                                    )}


                                    {!isEvent && booking.status === 'pending' && (
                                        <CancelInquiryButton inquiryId={booking.id} />
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
