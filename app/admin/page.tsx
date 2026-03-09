import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EventModerationButtons, ReportResolutionDialog, UserPenaltyDialog, HostFlagButton } from "./admin-management-client";

export default async function AdminPage({ searchParams }: {
    searchParams: Promise<{ view?: 'events' | 'reports' | 'users' }>
}) {
    const supabase = await createClient();
    const { view = 'events' } = await searchParams;

    let pendingEvents: any[] = [];
    let reports: any[] = [];
    let profiles: any[] = [];

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return redirect("/login");

        if (view === 'events') {
            const { data } = await supabase
                .from('events')
                .select('*')
                .or('status.eq.pending,admin_flagged.eq.true')
                .order('created_at', { ascending: false });
            if (data) pendingEvents = data;
        } else if (view === 'reports') {
            const { data } = await supabase
                .from('reports')
                .select('*, profiles:reporter_id(full_name)')
                .order('created_at', { ascending: false });
            if (data) reports = data;
        } else if (view === 'users') {
            const { data } = await supabase
                .from('host_trust_metrics')
                .select('*')
                .order('total_events', { ascending: false });
            if (data) profiles = data;
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-3 text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Admin Area - Restricted Access</span>
                </div>

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-serif font-bold text-stone-900">
                        {view === 'events' ? 'Event Moderation' : view === 'reports' ? 'Reports Center' : 'User Management'}
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/admin?view=events">
                            <Button variant={view === 'events' ? 'default' : 'outline'} className={view === 'events' ? 'bg-moss-600' : ''}>Events</Button>
                        </Link>
                        <Link href="/admin?view=users">
                            <Button variant={view === 'users' ? 'default' : 'outline'} className={view === 'users' ? 'bg-moss-600' : ''}>Users</Button>
                        </Link>
                        <Link href="/admin?view=reports">
                            <Button variant={view === 'reports' ? 'default' : 'outline'} className={view === 'reports' ? 'bg-moss-600' : ''}>Reports</Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                    {view === 'events' && (
                        <>
                            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                                <h3 className="font-medium text-stone-900">Pending Approval ({pendingEvents.length})</h3>
                            </div>

                            <table className="w-full text-sm text-left text-stone-600">
                                <thead className="bg-stone-50 text-stone-700 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Event Title</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Capacity</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {pendingEvents.length > 0 ? pendingEvents.map((event) => (
                                        <tr key={event.id} className={`hover:bg-stone-50/50 transition-colors ${event.admin_flagged ? 'bg-red-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-stone-900">{event.title}</div>
                                                {event.admin_flagged && (
                                                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1">
                                                        <AlertCircle className="h-3 w-3" /> Flagged: {event.admin_flagged_reason || 'Safety Concern'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-stone-500 border-stone-300">{event.category || 'Event'}</Badge>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-stone-900">€{event.price}</td>
                                            <td className="px-6 py-4">{event.capacity}</td>
                                            <td className="px-6 py-4 text-right">
                                                <EventModerationButtons eventId={event.id} />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400 italic">No pending events found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {view === 'reports' && (
                        <>
                            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                                <h3 className="font-medium text-stone-900">Active Reports ({reports.length})</h3>
                            </div>
                            <table className="w-full text-sm text-left text-stone-600">
                                <thead className="bg-stone-50 text-stone-700 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Target</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4">Reporter</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {reports.length > 0 ? reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-stone-900 capitalize">{report.target_type}</div>
                                                <div className="text-[11px] text-stone-400 font-mono">{report.target_id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-stone-800">{report.reason}</div>
                                                <div className="text-xs text-stone-500 line-clamp-1">{report.details}</div>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600">{(report.profiles as any)?.full_name || 'System User'}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="capitalize">
                                                    {report.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ReportResolutionDialog report={report} />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400 italic">No reports found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {view === 'users' && (
                        <>
                            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                                <h3 className="font-medium text-stone-900">Host Trust & Performance ({profiles.length})</h3>
                            </div>
                            <table className="w-full text-sm text-left text-stone-600">
                                <thead className="bg-stone-50 text-stone-700 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Metrics</th>
                                        <th className="px-6 py-4">Trust Level</th>
                                        <th className="px-6 py-4">Reports</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {profiles.length > 0 ? profiles.map((profile) => (
                                        <tr key={profile.user_id} className={`hover:bg-stone-50/50 transition-colors ${profile.admin_flagged ? 'bg-red-50/20' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-stone-900">{profile.full_name}</div>
                                                        <div className="text-[11px] text-stone-400">Events Hosted: {profile.total_events}</div>
                                                    </div>
                                                    <HostFlagButton profile={profile} />
                                                </div>
                                                {profile.admin_flagged && (
                                                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1">
                                                        <AlertCircle className="h-3 w-3" /> {profile.admin_flagged_reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-stone-900 font-medium">
                                                        Rating: {profile.avg_rating} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                        <span className="text-[11px] text-stone-400">({profile.rating_count})</span>
                                                    </div>
                                                    <div className="text-xs text-stone-500">Attendance: {profile.attendance_rate}%</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {(() => {
                                                        const rating = parseFloat(profile.avg_rating);
                                                        const att = profile.attendance_rate;
                                                        const evts = profile.total_events;
                                                        if (evts >= 8 && rating >= 4.5 && att >= 80) return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 text-[10px] py-0">Community Host</Badge>;
                                                        if (evts >= 3 && rating >= 4 && att >= 70) return <Badge className="bg-moss-500/10 text-moss-600 border-moss-200 text-[10px] py-0">Trusted Host</Badge>;
                                                        return <Badge variant="outline" className="text-stone-400 text-[10px] py-0">New Host</Badge>;
                                                    })()}
                                                    <div className="flex gap-1">
                                                        {profile.is_banned && <Badge variant="destructive" className="h-4 text-[9px] px-1 py-0">Banned</Badge>}
                                                        {profile.is_suspended_until && new Date(profile.is_suspended_until) > new Date() && (
                                                            <Badge variant="outline" className="h-4 text-[9px] px-1 py-0 text-amber-600 border-amber-200 bg-amber-50">Suspended</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 font-medium ${profile.report_count > 0 ? 'text-red-500' : 'text-stone-400'}`}>
                                                {profile.report_count} Reports
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <UserPenaltyDialog profile={profile} />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400 italic">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
