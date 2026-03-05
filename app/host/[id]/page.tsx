import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Globe, Calendar, Star, MapPin } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function HostProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) return <div className="p-8 text-center text-stone-500">Backend not configured</div>;

    // 1. Fetch Host Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

    if (profileError || !profile) {
        return notFound();
    }

    // 2. Fetch Host's Events (Upcoming & Past)
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
            *,
            studios:studio_id (name, location)
        `)
        .eq('creator_user_id', id)
        .eq('status', 'approved')
        .order('start_time', { ascending: true });

    const now = new Date().toISOString();
    const upcomingEvents = events?.filter(e => e.start_time > now) || [];
    const pastEvents = events?.filter(e => e.start_time <= now) || [];

    // 3. (Optional) Fetch average rating later when `event_feedback` is fully active and indexed.
    // For MVP phase 2, we can mock a 4.9 average or leave it out until ratings hit a certain threshold.
    const mockRating = "4.9";

    const hasInstagram = profile.social_links?.instagram;
    const hasWebsite = profile.social_links?.website;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">

            {/* Host Header */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl flex-shrink-0">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Host'} className="object-cover" />
                    <AvatarFallback className="bg-moss-100 text-moss-700 text-4xl font-serif">
                        {(profile.full_name || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-4 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-stone-900 leading-tight">
                                {profile.full_name || "Anonymous Host"}
                            </h1>
                            <div className="flex items-center gap-2 text-stone-500 mt-2 text-sm font-medium">
                                <Badge className="bg-moss-50 text-moss-700 hover:bg-moss-100 shadow-none border-moss-200">
                                    Trusted Host
                                </Badge>
                                <span>•</span>
                                <div className="flex items-center text-amber-600">
                                    <Star className="h-4 w-4 fill-current mr-1" />
                                    <span>{mockRating} (12 reviews)</span>
                                </div>
                            </div>
                        </div>

                        {(hasInstagram || hasWebsite) && (
                            <div className="flex gap-3">
                                {hasInstagram && (
                                    <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-stone-100 text-stone-600 hover:bg-moss-600 hover:text-white transition-colors duration-200 shadow-sm border border-stone-200 hover:border-moss-600">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                )}
                                {hasWebsite && (
                                    <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-stone-100 text-stone-600 hover:bg-moss-600 hover:text-white transition-colors duration-200 shadow-sm border border-stone-200 hover:border-moss-600">
                                        <Globe className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {profile.bio && (
                        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mt-4">
                            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">About The Host</h3>
                            <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                                {profile.bio}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-moss-600" />
                        Upcoming Events ({upcomingEvents.length})
                    </h2>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="bg-stone-50 border border-stone-200 border-dashed rounded-xl p-8 text-center text-stone-500">
                        This host currently has no upcoming events. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map(event => (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-stone-200 hover:border-moss-300 cursor-pointer flex flex-col bg-white">
                                    <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                                        {event.image_url ? (
                                            <img
                                                src={event.image_url}
                                                alt={event.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                                                <Calendar className="h-8 w-8 opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-stone-900 shadow-sm border border-stone-200/50">
                                            €{event.price}
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <p className="text-xs font-bold text-moss-600 tracking-wide uppercase">
                                                {format(new Date(event.start_time), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <h3 className="font-bold text-stone-900 text-lg leading-tight group-hover:text-moss-700 transition-colors line-clamp-2 mb-2">
                                            {event.title}
                                        </h3>
                                        <div className="mt-auto pt-2 flex items-center text-sm font-medium text-stone-500">
                                            <MapPin className="h-3.5 w-3.5 mr-1" />
                                            <span className="truncate">{event.city}</span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Events / History */}
            {pastEvents.length > 0 && (
                <div className="space-y-6 pt-6 opacity-80">
                    <h2 className="text-xl font-serif font-bold text-stone-400 flex items-center gap-2">
                        Past Events ({pastEvents.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pastEvents.slice(0, 3).map(event => (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors">
                                    <div className="h-12 w-12 rounded bg-stone-200 overflow-hidden flex-shrink-0">
                                        {event.image_url && <img src={event.image_url} className="w-full h-full object-cover grayscale opacity-80" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-stone-700 truncate">{event.title}</p>
                                        <p className="text-xs text-stone-500">{format(new Date(event.start_time), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
