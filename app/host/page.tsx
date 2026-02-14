import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HostDashboardPage() {
    return (
        <div className="space-y-8">

            {/* Welcome */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900">Dashboard</h1>
                    <p className="text-stone-500">Welcome back, Clay Space Berlin.</p>
                </div>
                <Button size="sm" variant="outline">View Public Profile</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">€2,450</div>
                        <p className="text-xs text-stone-500">+20% from last month</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Bookings</CardTitle>
                        <Users className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">48</div>
                        <p className="text-xs text-stone-500">+12 this week</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Upcoming Events</CardTitle>
                        <Calendar className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">3</div>
                        <p className="text-xs text-stone-500">Next event in 2 days</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-stone-600">Page Views</CardTitle>
                        <TrendingUp className="h-4 w-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-stone-900">842</div>
                        <p className="text-xs text-stone-500">+15% vs last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events List */}
            <div>
                <h2 className="text-lg font-serif font-semibold text-stone-900 mb-4">Upcoming Sessions</h2>
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="divide-y divide-stone-100">
                        {[
                            { title: "Intro to Wheel Throwing", date: "Sat, 24 Feb", time: "14:00", confirmed: 8, capacity: 10, status: "Active" },
                            { title: "Open Studio Session", date: "Sun, 25 Feb", time: "10:00", confirmed: 5, capacity: 15, status: "Active" },
                            { title: "Glazing Workshop", date: "Sat, 02 Mar", time: "15:00", confirmed: 2, capacity: 8, status: "Draft" },
                        ].map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500 font-bold text-xs">
                                        {session.date.split(" ")[1]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-900 text-sm">{session.title}</h4>
                                        <p className="text-xs text-stone-500">{session.date} • {session.time}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <span className="block text-sm font-medium text-stone-900">{session.confirmed} / {session.capacity}</span>
                                        <span className="text-xs text-stone-500">Booked</span>
                                    </div>
                                    <Badge variant={session.status === 'Active' ? 'default' : 'secondary'} className={session.status === 'Active' ? 'bg-moss-100 text-moss-800 hover:bg-moss-200' : ''}>
                                        {session.status}
                                    </Badge>
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
                        <Button variant="link" size="sm" className="text-stone-600">View All Events</Button>
                    </div>
                </div>
            </div>

        </div>
    );
}
