import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Globe, Instagram, Mail, Users, Star, ArrowLeft, ExternalLink, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FollowButton } from "@/components/host/follow-button";
import { HostInquiryButton } from "@/components/host/host-inquiry-button";
import { formatEventDate } from "@/lib/date-utils";

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

    // 4. Fetch Rating Stats & Reviews Feed
    const { data: allReviews, error: reviewsError } = await supabase
        .from('event_reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            event_id,
            user_id,
            profiles:user_id (full_name, avatar_url),
            events:event_id (title)
        `)
        .in('event_id', events?.map(e => e.id) || [])
        .order('created_at', { ascending: false });

    const avgRating = allReviews && allReviews.length > 0
        ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
        : null;
    const reviewCount = allReviews?.length || 0;

    // 5. Fetch Attendance & Community Stats
    const { data: allBookings } = await supabase
        .from('bookings')
        .select('checked_in, status')
        .in('event_id', events?.map(e => e.id) || [])
        .eq('status', 'confirmed');

    const confirmedCount = allBookings?.length || 0;
    const checkedInCount = allBookings?.filter(b => b.checked_in).length || 0;
    const attendanceRate = confirmedCount > 0
        ? Math.round((checkedInCount / confirmedCount) * 100)
        : 0;

    const now = new Date();
    const upcomingEvents = events?.filter(e => new Date(e.start_time) > now) || [];
    const pastEvents = events?.filter(e => new Date(e.start_time) <= now) || [];

    const totalEventsHosted = pastEvents.length;
    const numericRating = avgRating ? parseFloat(avgRating) : 0;

    let trustBadge = { label: "New Host", color: "border-stone-200 text-stone-500 bg-stone-50" };
    if (totalEventsHosted >= 8 && numericRating >= 4.5 && attendanceRate >= 80) {
        trustBadge = { label: "Community Host", color: "border-purple-200 text-purple-700 bg-purple-50" };
    } else if (totalEventsHosted >= 3 && numericRating >= 4 && attendanceRate >= 70) {
        trustBadge = { label: "Trusted Host", color: "border-moss-200 text-moss-700 bg-moss-50" };
    }

    return (
        <main className="flex-1 space-y-16">
            <section className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-serif font-black text-stone-900">About {profile.full_name?.split(' ')[0]}</h2>
                    <p className="text-stone-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Based in {profile.city || 'Amsterdam, NL'}
                        <span className="mx-2 text-stone-300">•</span>
                        Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="text-xl text-stone-600 leading-relaxed font-serif whitespace-pre-wrap">
                    {profile.bio || `Welcome to my profile! I love hosting community gatherings and bringing people together for meaningful experiences.`}
                </div>
            </section>

            {upcomingEvents.length > 0 && (
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-black text-stone-900 uppercase tracking-tighter">Upcoming Explorations ({upcomingEvents.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                        {upcomingEvents.map(event => (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden group shadow-xl">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt="" className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 bg-stone-900 flex items-center justify-center text-stone-700">
                                            <Calendar className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                        <Badge className="w-fit mb-3 bg-white/20 backdrop-blur-md text-white border-none uppercase tracking-widest text-[10px]">
                                            {event.category}
                                        </Badge>
                                        <h3 className="text-2xl font-black uppercase tracking-tight line-clamp-1">{event.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-stone-300 text-sm font-medium">
                                            <span>{formatEventDate(event.start_time, 'MMM d')}</span>
                                            <span>€{event.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-8 border-t border-stone-100 pt-16">
                <h2 className="text-2xl font-serif font-black text-stone-900 uppercase tracking-tighter">Guest Testimonials ({reviewCount})</h2>
                {allReviews && allReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {allReviews.map((review: any) => (
                            <div key={review.id} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 grayscale shadow-sm">
                                        <AvatarImage src={review.profiles?.avatar_url} />
                                        <AvatarFallback>{review.profiles?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-stone-900">{review.profiles?.full_name}</div>
                                        <div className="text-xs text-stone-400 font-medium">
                                            Guest for {review.events?.title}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-stone-900 text-stone-900' : 'text-stone-200'}`} />
                                    ))}
                                </div>
                                <p className="text-stone-600 leading-relaxed italic">"{review.comment}"</p>
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-stone-50 rounded-[32px] p-12 text-center text-stone-400 border-2 border-dashed border-stone-100">
                        <Star className="h-12 w-12 mx-auto mb-4 opacity-5" />
                        <p className="font-serif italic text-lg text-stone-500">No reviews yet. Be the first to join an event!</p>
                    </div>
                )}
            </section>

            {pastEvents.length > 0 && (
                <section className="space-y-8 border-t border-stone-100 pt-16">
                    <h2 className="text-2xl font-serif font-black text-stone-900 uppercase tracking-tighter">Concluded Gatherings ({pastEvents.length})</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {pastEvents.slice(0, 12).map(event => (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="aspect-square rounded-2xl overflow-hidden relative group grayscale hover:grayscale-0 transition-all duration-500 border border-stone-100">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-200">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest leading-tight">{event.title}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
