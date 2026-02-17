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

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <Link href="/messages" className="md:hidden text-stone-500 hover:text-stone-900 mr-2">
                            ←
                        </Link>
                        <Avatar className="h-10 w-10 border border-stone-200">
                            <AvatarImage src={currentChat.otherUser.avatar} />
                            <AvatarFallback className="bg-stone-100 text-stone-600">{currentChat.otherUser.initial}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-stone-900">{currentChat.otherUser.name}</h3>
                            <p className="text-xs text-stone-500">Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30 flex flex-col-reverse">
                    {/* Note: Flex-col-reverse keeps scroll at bottom, but connection listOrder needs to be reversed too if they came in asc */}
                    {/* Actually, let's just map normally and scroll to bottom or use proper flex. For MVP simple map. */}
                    <div className="flex flex-col justify-end min-h-full space-y-4">
                        {messages.map((msg: any) => {
                            const isMe = msg.sender_user_id === user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe
                                            ? "bg-moss-600 text-white rounded-br-none"
                                            : "bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm"
                                        }`}>
                                        <p>{msg.content}</p>
                                        <span className={`text-[10px] block mt-1 ${isMe ? "text-moss-100" : "text-stone-400"}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-stone-200">
                    <form action={handleSendMessage} className="flex gap-2">
                        <Input
                            name="content"
                            placeholder="Type a message..."
                            className="flex-1 bg-stone-50 border-stone-200 focus-visible:ring-moss-500"
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" className="bg-moss-600 hover:bg-moss-700 text-white shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
