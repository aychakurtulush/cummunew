import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

    const { data: bookings } = await supabase
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

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Your Bookings</h1>
                    <Link href="/">
                        <Button variant="outline">Browse More Events</Button>
                    </Link>
                </div>

                {!bookings || bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
                        <h3 className="text-lg font-medium text-stone-900 mb-2">No bookings yet</h3>
                        <p className="text-stone-500 mb-6">You haven't requested to join any events.</p>
                        <Link href="/">
                            <Button className="bg-moss-600 hover:bg-moss-700">Explore Events</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking: any) => (
                            <div key={booking.id} className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-sm transition-shadow">
                                {/* Image */}
                                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {booking.events.image_url ? (
                                        <img src={booking.events.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-xs text-stone-400 font-medium bg-stone-100">
                                            [{booking.events.category}]
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={
                                            booking.status === 'approved' ? 'default' :
                                                booking.status === 'rejected' ? 'destructive' : 'secondary'
                                        } className={
                                            booking.status === 'approved' ? 'bg-moss-600 hover:bg-moss-700' :
                                                booking.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : ''
                                        }>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </Badge>
                                        <span className="text-xs text-stone-400">Requested {new Date(booking.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-stone-900 mb-1 truncate">{booking.events.title}</h3>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(booking.events.start_time)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {booking.events.city}
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <Link href={`/events/${booking.events.id}`}>
                                    <Button variant="ghost" size="sm">View Event</Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
