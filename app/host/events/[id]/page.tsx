import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { AttendanceToggle } from "@/components/host/attendance-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BroadcastForm } from "@/components/host/broadcast-form";
import { Mail, ClipboardList, LayoutDashboard, UserCheck, UserMinus } from "lucide-react";
import { CheckInButton } from "@/components/host/check-in-button";

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

            <Tabs defaultValue="overview" className="w-full">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    <TabsList className="bg-stone-100 p-1 mb-6 flex w-fit sm:w-full min-w-full">
                        <TabsTrigger value="overview" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="attendees" className="gap-2">
                            <ClipboardList className="h-4 w-4" /> Attendees
                        </TabsTrigger>
                        <TabsTrigger value="messaging" className="gap-2">
                            <Mail className="h-4 w-4" /> Messaging
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Event Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                                        <div className="text-sm text-stone-500 mb-1">Total Bookings</div>
                                        <div className="text-3xl font-bold text-stone-900">{bookings?.length || 0}</div>
                                    </div>
                                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                                        <div className="text-sm text-stone-500 mb-1">Checked In</div>
                                        <div className="text-3xl font-bold text-moss-600">{bookings?.filter(b => b.checked_in).length || 0}</div>
                                    </div>
                                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                                        <div className="text-sm text-stone-500 mb-1">No Shows</div>
                                        <div className="text-3xl font-bold text-red-600">
                                            {event.start_time && new Date(event.start_time) < new Date()
                                                ? (bookings?.filter(b => b.status === 'confirmed' && !b.checked_in).length || 0)
                                                : 0}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-moss-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-moss-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Date & Time</div>
                                            <div className="text-stone-900">{new Date(event.start_time).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-moss-50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-moss-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Location</div>
                                            <div className="text-stone-900">{event.city}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-moss-50 rounded-lg">
                                            <Users className="h-5 w-5 text-moss-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Capacity</div>
                                            <div className="text-stone-900">{bookings?.filter(b => b.status === 'confirmed').length || 0} / {event.capacity} confirmed</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-1">
                            <Card className="h-full bg-stone-900 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-moss-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <CardHeader>
                                    <CardTitle className="text-lg text-stone-100 font-serif font-bold">Host Helper</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-stone-400 text-sm leading-relaxed">
                                        Need to update your guests? Head over to the <span className="text-moss-400 font-semibold italic">Messaging</span> tab to send a broadcast.
                                    </p>
                                    <div className="pt-2">
                                        <Link href={`/host/events/${id}/edit`}>
                                            <Button className="w-full bg-moss-600 hover:bg-moss-700 border-none shadow-lg shadow-moss-900/40">
                                                Update Event Info
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="attendees">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-serif">Guest List</CardTitle>
                                <p className="text-xs text-stone-500 font-normal">
                                    {bookings?.length || 0} Total • {bookings?.filter(b => b.status === 'confirmed').length || 0} Confirmed • {bookings?.filter(b => b.checked_in).length || 0} Checked In
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bookings && bookings.length > 0 ? bookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold border border-stone-200">
                                                {booking.profiles?.full_name?.charAt(0) || 'G'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-900">{booking.profiles?.full_name || 'Guest'}</div>
                                                <div className="text-xs text-stone-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(booking.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className={booking.status === 'confirmed' ? 'bg-moss-100 text-moss-800 hover:bg-moss-100 border-moss-200' : ''}>
                                                {booking.status}
                                            </Badge>

                                            {booking.status === 'confirmed' && (
                                                <CheckInButton
                                                    bookingId={booking.id}
                                                    initialCheckedIn={booking.checked_in || false}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-stone-500 py-12 flex flex-col items-center gap-3">
                                        <Users className="h-12 w-12 text-stone-200" />
                                        <p>No ones booked a spot yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="messaging">
                    <Card className="border-moss-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-serif flex items-center gap-2">
                                <Mail className="h-5 w-5 text-moss-600" />
                                Broadcast to Attendees
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BroadcastForm eventId={id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
