import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
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
