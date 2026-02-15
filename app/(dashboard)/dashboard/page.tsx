import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Heart, MessageSquare, PartyPopper } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage(props: any) {
    const searchParams = await props.searchParams;
    const isWelcome = searchParams?.welcome === 'true';

    return (
        <div className="space-y-8">
            {isWelcome && (
                <div className="bg-moss-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-moss-900/20 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                            <PartyPopper className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Welcome to Communew.!</h2>
                            <p className="text-moss-100 text-lg max-w-xl">
                                We're so glad you're here. Start exploring Berlin's best local hobbies and meet your neighbors.
                            </p>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-moss-900/20 rounded-full blur-3xl" />
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-stone-900">Dashboard</h1>
                <Link href="/">
                    <Button variant="outline">Browse Events</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/bookings" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-stone-600">My Bookings</CardTitle>
                            <CalendarDays className="h-4 w-4 text-moss-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-900">View</div>
                            <p className="text-xs text-stone-500">Upcoming & Past</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/saved" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-stone-600">Saved</CardTitle>
                            <Heart className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-900">Wishlist</div>
                            <p className="text-xs text-stone-500">Events you love</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/messages" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-stone-600">Messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-stone-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-900">Inbox</div>
                            <p className="text-xs text-stone-500">Chat with hosts</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="bg-moss-50 rounded-xl p-6 border border-moss-100 flex items-center justify-between">
                <div>
                    <h3 className="font-serif font-bold text-moss-900 text-lg">New to Berlin?</h3>
                    <p className="text-moss-700 max-w-xl mt-1">
                        Explore our curated list of events perfect for meeting new people and learning local skills.
                    </p>
                </div>
                <Link href="/">
                    <Button className="bg-moss-600 hover:bg-moss-700 text-white">Explore Now</Button>
                </Link>
            </div>
        </div>
    )
}
