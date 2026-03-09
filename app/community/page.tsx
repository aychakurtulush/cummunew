import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Star, MessageSquare, Sparkles, TrendingUp, Heart } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { CommunitySkeleton } from "@/components/community/community-skeleton";
import { formatEventDate } from "@/lib/date-utils";

export default async function CommunityPage() {
    const supabase = await createClient();
    if (!supabase) return <div>Backend not configured</div>;

    // Fetch recent events
    const { data: recentEvents } = await supabase
        .from('events')
        .select(`
            *,
            profiles:creator_user_id (full_name, avatar_url)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

    // Fetch recent bookings
    const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
            id,
            created_at,
            events (title, id, category),
            user_id
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(10);

    // Fetch total members
    // Fetch total members
    const { data: memberData, count: memberCount, error: memberError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: false })
        .limit(1);

    const finalMemberCount = memberCount ?? memberData?.length ?? 0;

    if (memberError) console.error("CommunityPage: Error fetching member count:", memberError);

    // Fetch events this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { count: eventsThisWeek, data: weeklyData, error: weeklyError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: false })
        .gte('created_at', oneWeekAgo.toISOString())
        .limit(1);

    const finalEventsThisWeek = eventsThisWeek ?? weeklyData?.length ?? 0;

    if (weeklyError) console.error("CommunityPage: Error fetching weekly events:", weeklyError);

    // Fetch categories with counts
    const { data: categoryCounts, error: catError } = await supabase
        .from('events')
        .select('category');

    if (catError) console.error("CommunityPage: Error fetching category counts:", catError);

    const catMap: Record<string, number> = {};
    categoryCounts?.forEach(e => {
        if (e.category) catMap[e.category] = (catMap[e.category] || 0) + 1;
    });

    const categoriesCount = categoryCounts?.length || 0;
    console.log("CommunityPage data:", { finalMemberCount, finalEventsThisWeek, categoriesCount });

    const categories = [
        { name: "Workshops", icon: <Sparkles className="h-4 w-4" />, count: catMap["Arts & Crafts"] || 0 },
        { name: "Gatherings", icon: <Users className="h-4 w-4" />, count: (catMap["Social & Games"] || 0) + (catMap["Language Exchange"] || 0) },
        { name: "Wellness", icon: <TrendingUp className="h-4 w-4" />, count: catMap["Sports & Wellness"] || 0 },
    ];

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start mb-12 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm overflow-hidden relative group">
                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">Community Hub</h1>
                            <p className="text-stone-500 mt-2 text-lg">See what's happening in Berlin's local scenes.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 relative z-10">
                            <Badge variant="secondary" className="bg-moss-50 text-moss-700 border-moss-100 flex gap-1.5 py-1.5 px-4 rounded-full">
                                <Users className="h-3.5 w-3.5" /> {finalMemberCount.toLocaleString()}+ Members
                            </Badge>
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 flex gap-1.5 py-1.5 px-4 rounded-full">
                                <Sparkles className="h-3.5 w-3.5" /> {finalEventsThisWeek || 0} Events this week
                            </Badge>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-moss-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-moss-500/10 transition-colors duration-700"></div>
                    </div>

                    <Suspense fallback={<CommunitySkeleton />}>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Feed Column */}
                            <div className="lg:col-span-2 space-y-8">
                                <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-moss-600" />
                                    Latest Activity
                                </h2>

                                <div className="space-y-6">
                                    {/* New Events */}
                                    {recentEvents?.map(event => (
                                        <div key={event.id} className="relative pl-8 border-l-2 border-stone-200 py-2 group">
                                            <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-stone-200 border-4 border-stone-50 group-hover:bg-moss-500 transition-colors"></div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                                                    <span>{formatEventDate(event.created_at, 'dd/MM/yyyy')}</span>
                                                    <span>•</span>
                                                    <span className="text-moss-600 font-bold uppercase tracking-wider">New Event published</span>
                                                </div>

                                                <Card className="border-none shadow-xl shadow-stone-200/40 overflow-hidden group-hover:shadow-moss-900/10 transition-shadow">
                                                    <CardContent className="p-0 flex flex-col sm:flex-row">
                                                        <div className="w-full sm:w-48 h-32 sm:h-auto bg-stone-100">
                                                            {event.image_url && <img src={event.image_url} alt="" className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="p-5 flex-1 space-y-3">
                                                            <Link href={`/events/${event.id}`}>
                                                                <h3 className="font-bold text-stone-900 group-hover:text-moss-700 transition-colors">{event.title}</h3>
                                                            </Link>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={event.profiles?.avatar_url} />
                                                                    <AvatarFallback>{event.profiles?.full_name?.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <Link href={`/host/${event.creator_user_id}`} className="text-xs text-stone-500 hover:underline">
                                                                    {event.profiles?.full_name}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Recent Bookings (Anonymized) */}
                                    {recentBookings?.map(booking => {
                                        const event = Array.isArray(booking.events) ? booking.events[0] : booking.events;
                                        if (!event) return null;

                                        return (
                                            <div key={booking.id} className="relative pl-8 border-l-2 border-stone-200 py-2 group">
                                                <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-stone-200 border-4 border-stone-50 group-hover:bg-amber-500 transition-colors"></div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                                                        <span>{formatEventDate(booking.created_at, 'dd/MM/yyyy')}</span>
                                                        <span>•</span>
                                                        <span className="text-amber-600 font-bold uppercase tracking-wider">New Spot Claimed</span>
                                                    </div>
                                                    <p className="text-stone-700 text-sm">
                                                        Someone just joined <Link href={`/events/${event.id}`} className="font-bold hover:text-moss-600 transition-colors">"{event.title}"</Link> in <span className="italic">{event.category}</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sidebar Column */}
                            <div className="space-y-8">
                                {/* Trending Categories */}
                                <Card className="border-none shadow-xl shadow-stone-200/40 p-6">
                                    <h3 className="text-lg font-serif font-bold text-stone-900 mb-6">Trending Topics</h3>
                                    <div className="space-y-4">
                                        {categories.map((cat, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-stone-100 rounded-lg group-hover:bg-moss-100 group-hover:text-moss-600 transition-colors">
                                                        {cat.icon}
                                                    </div>
                                                    <span className="font-bold text-stone-700 group-hover:text-stone-900">{cat.name}</span>
                                                </div>
                                                <Badge variant="outline" className="text-stone-400 border-stone-200">{cat.count} listings</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Community Values */}
                                <Card className="bg-moss-900 text-white border-none shadow-xl shadow-moss-900/20 p-8 relative overflow-hidden">
                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-moss-500 opacity-20 rounded-full blur-3xl -mr-16 -mb-16"></div>
                                    <h3 className="text-xl font-serif font-bold mb-4 relative z-10">Our Principles</h3>
                                    <ul className="space-y-4 text-stone-300 text-sm relative z-10">
                                        <li className="flex items-start gap-2">
                                            <Heart className="h-4 w-4 text-moss-400 mt-1 shrink-0" />
                                            <span>Focus on local, human-scale gatherings.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Heart className="h-4 w-4 text-moss-400 mt-1 shrink-0" />
                                            <span>Direct host-to-guest relationships.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Heart className="h-4 w-4 text-moss-400 mt-1 shrink-0" />
                                            <span>Sustainable, respectful use of space.</span>
                                        </li>
                                    </ul>
                                    <Button className="w-full mt-8 bg-moss-600 hover:bg-moss-700 border-none shadow-lg">Become a Host</Button>
                                </Card>
                            </div>
                        </div>
                    </Suspense>
                </div>
            </main>

            <Footer />
        </div>
    );
}
