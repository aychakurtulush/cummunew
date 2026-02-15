import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Send } from "lucide-react";

// Real data fetching would happen here
import { createClient } from "@/lib/supabase/server";

async function getConversations() {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Pending implementation of real messages
    return [];
}

export default async function MessagesPage() {
    const conversations = await getConversations();

    return (
        <div className="h-[600px] flex bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

            {/* Sidebar List */}
            <div className="w-1/3 border-r border-stone-200 flex flex-col">
                <div className="p-4 border-b border-stone-100">
                    <h2 className="text-lg font-serif font-bold text-stone-900 mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                        <Input placeholder="Search messages..." className="pl-9 bg-stone-50 border-stone-100" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length > 0 ? conversations.map((chat: any) => (
                        <div key={chat.id} className={`p-4 flex items-start gap-3 hover:bg-stone-50 cursor-pointer transition-colors ${chat.unread ? "bg-moss-50/50" : ""}`}>
                            <Avatar className="h-10 w-10 border border-stone-200">
                                <AvatarFallback className="bg-stone-100 text-stone-600">{chat.initial}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-sm truncate ${chat.unread ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>{chat.name}</h4>
                                    <span className="text-xs text-stone-400 shrink-0">{chat.time}</span>
                                </div>
                                <p className={`text-xs truncate ${chat.unread ? "text-stone-900 font-medium" : "text-stone-500"}`}>{chat.lastMessage}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-stone-500 text-sm">
                            No messages yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-stone-50/30 items-center justify-center text-stone-400">
                <p>Select a conversation to start messaging</p>
            </div>
        </div>
    );
}
