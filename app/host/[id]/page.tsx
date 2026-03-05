import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Globe, Instagram, Mail, Users, Star, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FollowButton } from "@/components/host/follow-button";

export default async function HostProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) return notFound();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

    if (!profile) return notFound();

    // 2. Check if following
    let isFollowing = false;
    if (user) {
        const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('host_id', id)
            .single();
        isFollowing = !!follow;
    }

    // 3. Fetch Events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('creator_user_id', id)
        .eq('status', 'approved')
        .order('start_time', { ascending: true });

    const now = new Date();
    const upcomingEvents = events?.filter(e => new Date(e.start_time) > now) || [];
    const pastEvents = events?.filter(e => new Date(e.start_time) <= now) || [];

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-stone-900 pt-12 pb-24 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-moss-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-moss-600 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-8 text-sm font-medium">
                            <ArrowLeft className="h-4 w-4" /> Back to Explore
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                            <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-stone-800 shadow-2xl">
                                <AvatarImage src={profile.avatar_url} className="object-cover" />
                                <AvatarFallback className="bg-stone-800 text-stone-400 text-4xl font-serif">
                                    {profile.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-center md:text-left space-y-3 flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">{profile.full_name}</h1>
                                    <Badge variant="outline" className="border-moss-500 text-moss-400 mx-auto md:mx-0 w-fit">Verified Host</Badge>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-stone-400 text-sm">
                                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-moss-500" /> {pastEvents.length} Events Hosted</span>
                                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-moss-500" /> Joined {new Date(profile.created_at).getFullYear()}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-6 md:mt-0 w-full md:w-auto justify-center md:justify-end">
                                <FollowButton
                                    hostId={id}
                                    initialIsFollowing={isFollowing}
                                    hasAuth={!!user}
                                />
                                <Button variant="outline" className="rounded-full h-12 border-stone-700 text-stone-300 hover:bg-stone-800 flex-1 md:flex-initial">
                                    Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 -mt-10 mb-20 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-xl shadow-stone-200/50">
                                <CardHeader>
                                    <CardTitle className="text-lg font-serif">About</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-stone-600 leading-relaxed italic">
                                        {profile.bio || "No biography provided."}
                                    </p>

                                    <div className="space-y-3 pt-2">
                                        {profile.social_links?.website && (
                                            <a href={profile.social_links.website} target="_blank" className="flex items-center gap-3 text-stone-500 hover:text-moss-600 transition-colors">
                                                <div className="p-2 bg-stone-50 rounded-lg group-hover:bg-moss-50"><Globe className="h-4 w-4" /></div>
                                                <span className="text-sm font-medium">Personal Website</span>
                                            </a>
                                        )}
                                        {profile.social_links?.instagram && (
                                            <a href={`https://instagram.com/${profile.social_links.instagram}`} target="_blank" className="flex items-center gap-3 text-stone-500 hover:text-moss-600 transition-colors">
                                                <div className="p-2 bg-stone-50 rounded-lg"><Instagram className="h-4 w-4" /></div>
                                                <span className="text-sm font-medium">@{profile.social_links.instagram}</span>
                                            </a>
                                        )}
                                        <div className="flex items-center gap-3 text-stone-500">
                                            <div className="p-2 bg-stone-50 rounded-lg"><Mail className="h-4 w-4" /></div>
                                            <span className="text-sm font-medium italic">Email verified</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-lg shadow-stone-200/30 bg-moss-900 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-moss-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <CardHeader>
                                    <CardTitle className="text-lg font-serif">Community Impact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="text-3xl font-bold">{pastEvents.length + upcomingEvents.length}</div>
                                        <div className="text-stone-400 text-sm">Total gatherings organized</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-3xl font-bold text-moss-500">Active</div>
                                        <div className="text-stone-400 text-sm">Community Status</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Upcoming */}
                            <section className="space-y-6">
                                <h2 className="text-2xl font-serif font-bold text-stone-900">Upcoming Events ({upcomingEvents.length})</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                        <Link key={event.id} href={`/events/${event.id}`}>
                                            <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-500 border-none shadow-md">
                                                <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
                                                    {event.image_url ? (
                                                        <img src={event.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-stone-200">
                                                            <Calendar className="h-12 w-12" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-sm px-3 py-1 rounded-full text-xs font-bold text-stone-900 uppercase tracking-wider">
                                                        {event.category}
                                                    </div>
                                                </div>
                                                <CardContent className="p-6">
                                                    <h3 className="text-xl font-bold text-stone-900 mb-3 line-clamp-1 group-hover:text-moss-700 transition-colors uppercase tracking-tight">{event.title}</h3>
                                                    <div className="flex flex-col gap-2 text-stone-500 text-sm">
                                                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-moss-500" /> {new Date(event.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-moss-500" /> {event.city}</span>
                                                    </div>
                                                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100">
                                                        <span className="text-stone-900 font-black text-lg">€{event.price}</span>
                                                        <span className="text-xs font-bold uppercase tracking-widest text-moss-600 group-hover:translate-x-1 transition-transform">Book Spot →</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )) : (
                                        <Card className="col-span-full py-16 flex flex-col items-center justify-center text-stone-400 border-dashed border-2 bg-stone-50/50">
                                            <Calendar className="h-12 w-12 mb-4 opacity-10" />
                                            <p className="font-medium italic">No upcoming events at the moment.</p>
                                        </Card>
                                    )}
                                </div>
                            </section>

                            {/* Past Events History */}
                            {pastEvents.length > 0 && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-serif font-bold text-stone-400">Past Hosted Events ({pastEvents.length})</h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {pastEvents.slice(0, 5).map(event => (
                                            <Link key={event.id} href={`/events/${event.id}`}>
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 hover:border-moss-200 hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-lg bg-stone-50 overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100">
                                                            {event.image_url ? (
                                                                <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-stone-200">
                                                                    <Calendar className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-stone-700 group-hover:text-stone-900 transition-colors uppercase tracking-tighter">{event.title}</h4>
                                                            <p className="text-xs text-stone-500">{new Date(event.start_time).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-stone-400 border-stone-200 font-normal">Concluded</Badge>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
