import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, AlertCircle, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EarningsPage() {
    const supabase = await createClient();
    if (!supabase) return <div>Backend not configured</div>;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch all events by this host with their bookings
    const { data: events, error } = await supabase
        .from('events')
        .select(`
            id,
            title,
            price,
            start_time,
            status,
            bookings (
                id,
                status,
                checked_in
            )
        `)
        .eq('creator_user_id', user.id)
        .order('start_time', { ascending: false });

    if (error) {
        console.error('Error fetching earnings data:', error);
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
            <h2 className="font-bold mb-2 text-lg">Error loading earnings data</h2>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
        </div>;
    }

    // Process data for fees
    const now = new Date();
    const completedEvents = events?.filter(e => new Date(e.start_time) < now) || [];

    let totalRevenue = 0;
    let totalPlatformFee = 0;
    let totalCheckedIn = 0;

    const eventStats = completedEvents.map(event => {
        const checkedInCount = event.bookings?.filter((b: any) => b.checked_in).length || 0;
        const confirmedCount = event.bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
        const revenue = checkedInCount * Number(event.price);
        const fee = revenue * 0.05;

        totalRevenue += revenue;
        totalPlatformFee += fee;
        totalCheckedIn += checkedInCount;

        return {
            id: event.id,
            title: event.title,
            date: new Date(event.start_time).toLocaleDateString(),
            price: Number(event.price),
            confirmed: confirmedCount,
            checkedIn: checkedInCount,
            revenue,
            fee
        };
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900">Earnings & Fees</h1>
                    <p className="text-stone-500">Track your revenue and Communew platform fees.</p>
                </div>
                <div className="bg-stone-100 border border-stone-200 rounded-lg p-3 flex items-start gap-3 max-w-md">
                    <AlertCircle className="w-5 h-5 text-stone-600 mt-0.5" />
                    <p className="text-xs text-stone-600 leading-relaxed">
                        <span className="font-bold">Pilot Phase:</span> Platform fees (5% per check-in) are informational and settled manually each month.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-stone-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wider">Gross Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-stone-900">€{totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center text-xs text-stone-500 mt-1 font-medium gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Based on {totalCheckedIn} check-ins
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-stone-200 bg-stone-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wider">Platform Fees (5%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-stone-700">€{totalPlatformFee.toFixed(2)}</div>
                        <p className="text-xs text-stone-500 mt-1">Settled monthly</p>
                    </CardContent>
                </Card>

                <Card className="border-stone-900 bg-stone-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-stone-400 uppercase tracking-wider">Net (Informational)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">€{(totalRevenue - totalPlatformFee).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Event List */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                    <h2 className="font-serif font-bold text-stone-900">Completed Events</h2>
                </div>

                {eventStats.length === 0 ? (
                    <div className="p-12 text-center text-stone-500 italic">
                        No completed events with revenue data yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase text-stone-400 font-medium">
                                    <th className="px-6 py-4 border-b border-stone-100">Event</th>
                                    <th className="px-6 py-4 border-b border-stone-100">Date</th>
                                    <th className="px-6 py-4 border-b border-stone-100">Check-ins</th>
                                    <th className="px-6 py-4 border-b border-stone-100">Revenue</th>
                                    <th className="px-6 py-4 border-b border-stone-100 text-right">Fee (5%)</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {eventStats.map((stat) => (
                                    <tr key={stat.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4 border-b border-stone-100 font-medium text-stone-900">{stat.title}</td>
                                        <td className="px-6 py-4 border-b border-stone-100 text-stone-600">{stat.date}</td>
                                        <td className="px-6 py-4 border-b border-stone-100">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-stone-400" />
                                                <span>{stat.checkedIn} <span className="text-stone-400 text-xs">/ {stat.confirmed}</span></span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-stone-100 font-medium">€{stat.revenue.toFixed(2)}</td>
                                        <td className="px-6 py-4 border-b border-stone-100 text-right font-bold text-stone-700">€{stat.fee.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
