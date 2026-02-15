import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, TrendingUp, AlertCircle, Check, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookingActionButtons } from "@/components/host/booking-action-buttons";

export default async function HostDashboardOverview() {
    const supabase = await createClient();

    if (!supabase) {
        return redirect("/login");
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Fetch Host's Events
    const { data: events } = await supabase
        .from('events')
        .select('id, title, start_time, capacity')
        .eq('creator_user_id', user.id);

    const eventIds = events?.map(e => e.id) || [];

    // Fetch Bookings for those events
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id, 
            status, 
            created_at,
            user_id,
            event_id,
            events (title, start_time)
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

    // Calculate stats
    const totalRevenue = 0; // We don't have payments yet

    const totalBookings = bookings?.filter(b => b.status === 'approved').length || 0;
    const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
    const upcomingEventsCount = events?.filter(e => new Date(e.start_time) > new Date()).length || 0;

    return (
        <div className="space-y-8">

            {/* Welcome */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900">Host Dashboard</h1>
                    <p className="text-stone-500">Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Host'}.</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                    <Link href="/profile">View Public Profile</Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">€{totalRevenue}</div>
                        <p className="text-xs text-stone-500">Estimated earnings</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Confirmed Guests</CardTitle>
                        <Users className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">{totalBookings}</div>
                        <p className="text-xs text-stone-500">Across all events</p>
                    </CardContent>
                </Card>

                <Card className={`hover:shadow-sm transition-shadow ${pendingBookings.length > 0 ? 'border-moss-500 bg-moss-50' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Pending Requests</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${pendingBookings.length > 0 ? 'text-moss-600' : 'text-stone-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${pendingBookings.length > 0 ? 'text-moss-700' : 'text-stone-900'}`}>
                            {pendingBookings.length}
                        </div>
                        <p className={`text-xs ${pendingBookings.length > 0 ? 'text-moss-600' : 'text-stone-500'}`}>
                            Requires action
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Active Events</CardTitle>
                        <TrendingUp className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">{upcomingEventsCount}</div>
                        <p className="text-xs text-stone-500">Upcoming on calendar</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Requests List */}
            {pendingBookings.length > 0 && (
                <div>
                    <h2 className="text-lg font-serif font-semibold text-stone-900 mb-4">Pending Requests</h2>
                    <div className="bg-white rounded-xl border border-moss-200 overflow-hidden shadow-sm">
                        <div className="divide-y divide-stone-100">
                            {pendingBookings.map((booking: any) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-moss-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white border border-moss-100 rounded-full flex items-center justify-center text-moss-600 font-bold text-xs shadow-sm">
                                            Req
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-stone-900 text-sm">Request for "{booking.events?.title}"</h4>
                                            <p className="text-xs text-stone-500">Received {new Date(booking.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>

                                        {/* Action Buttons Component */}
                                        <BookingActionButtons bookingId={booking.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Events List */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-serif font-semibold text-stone-900">Your Events</h2>
                    <Button variant="link" asChild className="text-moss-600 p-0 h-auto">
                        <Link href="/host/events">Manage All</Link>
                    </Button>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="divide-y divide-stone-100">
                        {events && events.length > 0 ? events.slice(0, 5).map((event: any) => (
                            <div key={event.id} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-stone-900 text-sm">{event.title}</h4>
                                    <p className="text-xs text-stone-500">
                                        {new Date(event.start_time).toLocaleDateString()} • {event.capacity} spots
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/host/events/${event.id}`}>Manage</Link>
                                </Button>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-stone-500">
                                No events yet. <Link href="/host/events/create" className="text-moss-600 font-medium underline">Create your first event</Link>.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
