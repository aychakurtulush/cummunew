import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Heart, MessageSquare, PartyPopper, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardPage(props: any) {
    const searchParams = await props.searchParams;
    const isWelcome = searchParams?.welcome === 'true';

    const supabase = await createClient();
    if (!supabase) return <div>Database not configured</div>;
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch followed hosts
    const { data: follows } = user ? await supabase
        .from('follows')
        .select(`
            host_id,
            profiles:host_id (full_name, avatar_url)
        `)
        .eq('follower_id', user.id)
        .limit(4) : { data: [] };

    return (
        <div className="space-y-8">
            {isWelcome && (
                <div className="bg-moss-700 rounded-2xl p-6 md:p-10 text-white shadow-xl shadow-moss-900/10 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                            <PartyPopper className="h-10 w-10 text-moss-50" />
                        </div>
                        <div className="text-left space-y-2">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">Welcome to the community!</h2>
                            <p className="text-moss-100 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                                You’re now part of Berlin’s most authentic circle. Ready to find your people?
                            </p>
                            <div className="pt-2">
                                <Link href="/">
                                    <Button className="bg-white text-moss-900 hover:bg-moss-50 font-semibold border-none">
                                        Start Exploring
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-32 -right-32 h-96 w-96 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                    <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-moss-900/30 rounded-full blur-3xl" />
                </div>
            )}

            <div className="flex justify-between items-end pb-2">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Your Hub</h1>
                    <p className="text-stone-500 mt-1">Manage your schedule and connections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/bookings" className="block h-full">
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full border-stone-200 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold text-stone-700 group-hover:text-moss-700 transition-colors">My Bookings</CardTitle>
                            <CalendarDays className="h-5 w-5 text-stone-400 group-hover:text-moss-600 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-stone-900 mb-1">Schedule</div>
                            <p className="text-sm text-stone-500 group-hover:text-stone-600">
                                View your upcoming workshops and meetups.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/saved" className="block h-full">
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full border-stone-200 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold text-stone-700 group-hover:text-rose-600 transition-colors">Saved Events</CardTitle>
                            <Heart className="h-5 w-5 text-stone-400 group-hover:text-rose-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-stone-900 mb-1">Wishlist</div>
                            <p className="text-sm text-stone-500 group-hover:text-stone-600">
                                The experiences you're keeping an eye on.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/messages" className="block h-full">
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full border-stone-200 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold text-stone-700 group-hover:text-blue-600 transition-colors">Messages</CardTitle>
                            <MessageSquare className="h-5 w-5 text-stone-400 group-hover:text-blue-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-stone-900 mb-1">Inbox</div>
                            <p className="text-sm text-stone-500 group-hover:text-stone-600">
                                Chats with hosts and fellow attendees.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* Community Feed / Following */}
                <Card className="border-none shadow-xl shadow-stone-200/40">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-serif">Hosts You Follow</CardTitle>
                        <Users className="h-5 w-5 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        {follows && follows.length > 0 ? (
                            <div className="space-y-4">
                                {follows.map((follow: any) => (
                                    <Link key={follow.host_id} href={`/host/${follow.host_id}`}>
                                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-stone-200">
                                                    <AvatarImage src={follow.profiles?.avatar_url} />
                                                    <AvatarFallback>{follow.profiles?.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-stone-900 group-hover:text-moss-700 transition-colors uppercase tracking-tight text-sm">{follow.profiles?.full_name}</p>
                                                    <p className="text-xs text-stone-500 italic">View Host Feed</p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-stone-400 group-hover:text-stone-900 transition-colors">→</div>
                                        </div>
                                    </Link>
                                ))}
                                <Link href="/community" className="block text-center pt-4">
                                    <Button variant="ghost" size="sm" className="text-stone-500 hover:text-moss-600">Find more communities</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-stone-400 text-sm italic mb-4">You aren't following any hosts yet.</p>
                                <Link href="/community">
                                    <Button variant="outline" size="sm" className="rounded-full border-stone-200">Discover Hosts</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="bg-gradient-to-br from-moss-900 to-stone-900 rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl shadow-moss-900/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-serif font-bold text-xl mb-4 text-moss-50">Berlin Hub Activity</h3>
                        <p className="text-stone-300 text-sm leading-relaxed mb-6">
                            See what your network is booking and which new workshops are trending in the Community Hub.
                        </p>
                        <Link href="/community" className="inline-block mt-auto">
                            <Button className="bg-moss-500 hover:bg-moss-600 text-white rounded-full px-6 shadow-lg shadow-moss-900/40 border-none">
                                Open Activity Feed
                            </Button>
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                </div>
            </div>
        </div>
    )
}
