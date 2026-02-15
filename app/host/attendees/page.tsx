import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookingActionButtons } from "@/components/host/booking-action-buttons";

export default async function AttendeesPage() {
    const supabase = await createClient();

    if (!supabase) return redirect("/login");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Fetch bookings for events created by this host
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id,
            status,
            created_at,
            events (title),
            profiles:user_id (full_name, email)
        `)
        .eq('events.creator_user_id', user.id); // This filter requires a join or two-step fetch. 
    // Simpler for MVP: Fetch events first, then bookings.

    // 1. Get Host's Events
    const { data: events } = await supabase.from('events').select('id, title').eq('creator_user_id', user.id);
    const eventIds = events?.map(e => e.id) || [];

    // 2. Get Bookings
    let realBookings: any[] = [];
    if (eventIds.length > 0) {
        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id,
                status,
                user_id,
                event_id,
                events (title)
            `)
            .in('event_id', eventIds);

        if (bookingsData) {
            // 3. Fetch Profiles for these bookings
            const userIds = Array.from(new Set(bookingsData.map((b: any) => b.user_id)));
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, full_name, email')
                .in('user_id', userIds);

            // 4. Merge
            realBookings = bookingsData.map((b: any) => ({
                ...b,
                profiles: profiles?.find((p: any) => p.user_id === b.user_id) || { full_name: 'Guest' }
            }));
        }

        if (bookingsError) {
            console.error("Error fetching bookings:", bookingsError);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-stone-900">Attendees</h1>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-stone-100 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                        <Input placeholder="Search attendees..." className="pl-9 bg-stone-50 border-stone-200" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {realBookings.length > 0 ? realBookings.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-stone-100 text-stone-600 font-medium text-xs">
                                                    {(booking.profiles?.full_name || 'Guest').charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-stone-900">{booking.profiles?.full_name || 'Guest User'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{booking.events?.title}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                            className={booking.status === 'confirmed' ? 'bg-moss-100 text-moss-800' : 'bg-terracotta-100 text-terracotta-800'}>
                                            {booking.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Contact (Coming Soon)">
                                                <Mail className="h-4 w-4 text-stone-400 hover:text-stone-600" />
                                            </Button>
                                            <BookingActionButtons bookingId={booking.id} status={booking.status} />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">
                                        No attendees found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
