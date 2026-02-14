import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock Attendees
const MOCK_ATTENDEES = [
    { id: 1, name: "Sarah Miller", email: "sarah@example.com", event: "Intro to Wheel Throwing", status: "Confirmed", ticket: "General" },
    { id: 2, name: "Tom K.", email: "tom@example.com", event: "Intro to Wheel Throwing", status: "Confirmed", ticket: "General" },
    { id: 3, name: "Lisa Wong", email: "lisa@example.com", event: "Open Studio Session", status: "Pending", ticket: "Student" },
];

export default function AttendeesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-stone-900">Attendees</h1>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">

                {/* Toolbar */}
                <div className="p-4 border-b border-stone-100 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                        <Input placeholder="Search attendees..." className="pl-9 bg-stone-50 border-stone-200" />
                    </div>
                    {/* Add filters later */}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Ticket Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {MOCK_ATTENDEES.map((person) => (
                                <tr key={person.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-stone-100 text-stone-600 font-medium text-xs">
                                                    {person.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-stone-900">{person.name}</div>
                                                <div className="text-xs text-stone-500">{person.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{person.event}</td>
                                    <td className="px-6 py-4 text-stone-500">{person.ticket}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={person.status === 'Confirmed' ? 'default' : 'secondary'} className={person.status === 'Confirmed' ? 'bg-moss-100 text-moss-800' : 'bg-terracotta-100 text-terracotta-800'}>
                                            {person.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Mail className="h-4 w-4 text-stone-400 hover:text-stone-600" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
