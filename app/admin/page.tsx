import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Mock Pending Events
const MOCK_PENDING = [
    { id: 101, title: "Pottery for Kids", host: "Clay Space Berlin", category: "Arts", submitted: "2h ago" },
    { id: 102, title: "Sourdough Basics", host: "Berlin Bread Co.", category: "Food", submitted: "5h ago" },
];

export default async function AdminPage() {
    const supabase = await createClient();
    let pendingEvents = MOCK_PENDING;

    // In a real app, we check if user is admin role
    /*
    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        // Check role...
    }
    */

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-3 text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
                    <ShieldAlert className="h-5 w-5" />
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
                                <th className="px-6 py-4">Host</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Submitted</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {pendingEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-stone-900">{event.title}</td>
                                    <td className="px-6 py-4">{event.host}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-stone-500 border-stone-300">{event.category}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">{event.submitted}</td>
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
                            ))}
                        </tbody>
                    </table>
                    {pendingEvents.length === 0 && (
                        <div className="p-12 text-center text-stone-500">
                            All caught up! No pending reviews.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
