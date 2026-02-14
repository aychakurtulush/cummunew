import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

// Mock Data
const MOCK_BOOKINGS = [
    {
        id: "mb-1",
        status: "confirmed",
        events: {
            title: "Intro to Wheel Throwing",
            start_time: new Date(Date.now() + 86400000).toISOString(),
            city: "Kreuzberg",
            price: 45,
            category: "Arts"
        }
    },
    {
        id: "mb-2",
        status: "pending",
        events: {
            title: "Italian Pasta Masterclass",
            start_time: new Date(Date.now() + 172800000).toISOString(),
            city: "Mitte",
            price: 65,
            category: "Food"
        }
    }
];

export default async function BookingsPage() {
    const supabase = await createClient();

    let bookings = [];
    let user = null;

    if (supabase) {
        const { data } = await supabase.auth.getUser();
        user = data?.user;

        if (!user) {
            redirect('/login');
        }

        const { data: dbBookings, error } = await supabase
            .from('bookings')
            .select(`
          *,
          events (
            title,
            start_time,
            end_time,
            location_type,
            city,
            price,
            category
          )
        `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && dbBookings) {
            bookings = dbBookings;
        }
    } else {
        // Demo Mode
        bookings = MOCK_BOOKINGS;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-stone-900">My Bookings</h1>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-stone-600">Past</Button>
                    <Button variant="outline" size="sm" className="bg-white">Upcoming</Button>
                </div>
            </div>

            {!supabase && (
                <div className="text-xs text-stone-400 text-center uppercase tracking-widest mb-4">Demo Mode - Mock Data</div>
            )}

            <div className="space-y-4">
                {bookings && bookings.length > 0 ? (
                    bookings.map((booking: any) => (
                        <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            {/* Image Placeholder */}
                            <div className="w-full sm:w-48 h-32 sm:h-auto bg-stone-200 relative shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs font-medium">
                                    [{booking.events?.category}]
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">{booking.events?.title}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span>{formatDate(booking.events?.start_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{formatTime(booking.events?.start_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span>{booking.events?.city}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge
                                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                        className={booking.status === 'confirmed' ? 'bg-moss-600' : 'bg-terracotta-100 text-terracotta-800'}
                                    >
                                        {booking.status === 'confirmed' ? 'Confirmed' : 'Pending Approval'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-stone-100">
                                    <div className="text-sm text-stone-600">
                                        1 spot • <span className="font-semibold text-stone-900">€{booking.events?.price}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs">Message Host</Button>
                                        <Button variant="outline" size="sm" className="h-8 text-xs">Details</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                        <h3 className="text-lg font-medium text-stone-900 mb-1">No bookings found</h3>
                        <p className="mb-4">You haven't booked any events yet.</p>
                        <Link href="/">
                            <Button>Explore Events</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
