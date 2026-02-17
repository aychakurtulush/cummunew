import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send } from "lucide-react";
import Link from "next/link";
import { getConversations, getMessages, sendMessage } from "@/app/messages/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: conversationId } = await params;
    const conversations = await getConversations();
    const messages = await getMessages(conversationId);

    // Find current conversation details
    const currentChat = conversations.find((c: any) => c.id === conversationId);

    if (!currentChat) {
        // Handle 404 or redirect
        redirect('/messages');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase!.auth.getUser();

    async function handleSendMessage(formData: FormData) {
        'use server'
        const content = formData.get('content') as string;
        if (!content.trim()) return;
        await sendMessage(conversationId, content);
    }

    return (
        <div className="h-[600px] flex bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

            {/* Sidebar List (Hidden on mobile when chat is open, ideally) */}
            <div className="hidden md:flex w-1/3 border-r border-stone-200 flex-col">
                <div className="p-4 border-b border-stone-100">
                    <h2 className="text-lg font-serif font-bold text-stone-900 mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                        <Input placeholder="Search messages..." className="pl-9 bg-stone-50 border-stone-100" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((chat: any) => (
                        <Link href={`/messages/${chat.id}`} key={chat.id}>
                            <div className={`p-4 flex items-start gap-3 hover:bg-stone-50 cursor-pointer transition-colors border-b border-stone-50 ${chat.id === conversationId ? "bg-moss-50" : ""}`}>
                                <Avatar className="h-10 w-10 border border-stone-200">
                                    <AvatarImage src={chat.otherUser.avatar} />
                                    <AvatarFallback className="bg-stone-100 text-stone-600">{chat.otherUser.initial}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-medium text-stone-900 truncate">{chat.otherUser.name}</h4>
                                    </div>
                                    <p className="text-xs text-stone-500 truncate">{chat.lastMessage}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Chat Area - Now Client Side */}
            <ChatInterface
                initialMessages={messages}
                currentUser={user}
                conversationId={conversationId}
                otherUser={currentChat.otherUser}
            />
        </div>
    );
}
