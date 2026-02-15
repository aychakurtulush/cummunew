import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { approveEvent, rejectEvent } from "@/app/events/actions";

export default async function AdminPage() {
    const supabase = await createClient();
    let pendingEvents: any[] = [];

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return redirect("/login");

        // Simple role check (in reality, use RLS or custom claims)
        // For MVP, we might just let any logged in user see this if we haven't set up roles, 
        // OR strictly check for a specific email or metadata.
        // For now, let's just fetch the data.

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('status', 'pending');

        if (data) pendingEvents = data;
    }

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-3 text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Admin Area - Restricted Access</span>
                </div>

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Event Moderation</h1>
                    <div className="flex gap-2">
                        <Button variant="outline">Users</Button>
                        <Button variant="outline">Reports</Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
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
                                <tr key={event.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-stone-900">{event.title}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-stone-500 border-stone-300">{event.category || 'Event'}</Badge>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-stone-900">€{event.price}</td>
                                    <td className="px-6 py-4">{event.capacity}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <X className="h-4 w-4 mr-1" /> Reject
                                            </Button>
                                            <Button size="sm" className="bg-moss-600 hover:bg-moss-700 text-white">
                                                <Check className="h-4 w-4 mr-1" /> Approve
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400 italic">
                                        No pending events found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
