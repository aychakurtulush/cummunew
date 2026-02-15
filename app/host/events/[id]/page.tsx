import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) return redirect("/login");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Fetch event details
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (!event) return notFound();

    // Security: Only allow creator to manage
    if (event.creator_user_id !== user.id) {
        return <div className="p-8 text-center text-red-600">Unauthorized access.</div>;
    }

    // Fetch bookings for this event
    const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

    // Fetch profiles manually
    let bookings: any[] = [];
    if (bookingsData && bookingsData.length > 0) {
        const userIds = Array.from(new Set(bookingsData.map((b: any) => b.user_id)));
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', userIds);

        bookings = bookingsData.map((b: any) => ({
            ...b,
            profiles: profiles?.find((p: any) => p.user_id === b.user_id) || { full_name: 'Guest' }
        }));
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/host/events">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900">{event.title}</h1>
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                        <Badge variant="outline" className="mr-2">{event.status}</Badge>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.start_time).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/events/${id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" /> View Live
                        </Link>
                    </Button>
                    <Button asChild className="bg-moss-600 hover:bg-moss-700">
                        <Link href={`/host/events/${id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Event
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-50 p-4 rounded-lg">
                                <div className="text-sm text-stone-500 mb-1">Total Bookings</div>
                                <div className="text-2xl font-bold text-stone-900">{bookings?.length || 0}</div>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-lg">
                                <div className="text-sm text-stone-500 mb-1">Revenue</div>
                                <div className="text-2xl font-bold text-stone-900">€0</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bookings && bookings.length > 0 ? bookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 border border-stone-100 rounded-lg">
                                        <div>
                                            <div className="font-medium text-stone-900">{booking.profiles?.full_name || 'Guest'}</div>
                                            <div className="text-xs text-stone-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                )) : (
                                    <div className="text-center text-stone-500 py-4">No bookings yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Details */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <div className="font-medium text-stone-700 mb-1">Location</div>
                                <div className="flex items-start gap-2 text-stone-600">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{event.city}</span>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="font-medium text-stone-700 mb-1">Capacity</div>
                                <div className="flex items-center gap-2 text-stone-600">
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>{bookings?.length || 0} / {event.capacity}</span>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="font-medium text-stone-700 mb-1">Price</div>
                                <div className="text-stone-600">€{event.price}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
