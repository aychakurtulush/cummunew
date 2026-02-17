import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Send } from "lucide-react";
import Link from "next/link";
import { getConversations } from "@/app/messages/actions";

const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
                        <Link href={`/messages/${chat.id}`} key={chat.id}>
                            <div className={`p-4 flex items-start gap-3 hover:bg-stone-50 cursor-pointer transition-colors border-b border-stone-50`}>
                                <Avatar className="h-10 w-10 border border-stone-200">
                                    <AvatarImage src={chat.otherUser.avatar} />
                                    <AvatarFallback className="bg-stone-100 text-stone-600">{chat.otherUser.initial}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-medium text-stone-900 truncate">{chat.otherUser.name}</h4>
                                        <span className="text-xs text-stone-400 shrink-0">{formatDate(chat.lastMessageTime)}</span>
                                    </div>
                                    <p className="text-xs text-stone-500 truncate">{chat.lastMessage}</p>
                                </div>
                            </div>
                        </Link>
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
