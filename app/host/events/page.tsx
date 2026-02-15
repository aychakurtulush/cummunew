import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteEventMenuItem } from "./components/delete-event-menu-item";

export default async function HostEventsPage() {
    const supabase = await createClient();
    let events: any[] = [];

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect('/login');

        // Fetch real events
        const { data } = await supabase.from('events').select('*').eq('creator_user_id', user.id);
        if (data && data.length > 0) {
            events = data.map((e: any) => ({
                id: e.id,
                title: e.title,
                date: new Date(e.start_time).toLocaleDateString(),
                status: e.status === 'approved' ? 'Active' : 'Draft',
                sold: 0, // Implement real booking count later
                capacity: e.capacity,
                revenue: 0 // Implement real revenue later
            }));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-stone-900">Manage Events</h1>
                <Link href="/host/events/create">
                    <Button className="bg-moss-600 hover:bg-moss-700 text-white gap-2">
                        <Plus className="h-4 w-4" /> New Event
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left text-stone-600">
                    <thead className="bg-stone-50 text-stone-700 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Event Name</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Sold / Cap</th>
                            <th className="px-6 py-4 text-right">Est. Revenue</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {events.map((event: any) => (
                            <tr key={event.id} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-stone-900">{event.title}</td>
                                <td className="px-6 py-4 text-stone-500">{event.date}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={event.status === 'Active' ? 'default' : 'secondary'} className={event.status === 'Active' ? 'bg-moss-100 text-moss-800' : ''}>
                                        {event.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    {event.sold} <span className="text-stone-400 font-normal">/ {event.capacity}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-stone-900">
                                    €{event.revenue}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-stone-100">
                                                <MoreHorizontal className="h-4 w-4 text-stone-400" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuItem>
                                                <Link href={`/host/events/${event.id}/edit`} className="w-full">
                                                    Edit Event
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Link href={`/events/${event.id}`} className="w-full">
                                                    View Live Page
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DeleteEventMenuItem eventId={event.id} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {events.length === 0 && (
                    <div className="p-12 text-center text-stone-500">
                        No events found. Create your first one!
                    </div>
                )}
            </div>
        </div>
    );
}
