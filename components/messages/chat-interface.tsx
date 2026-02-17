"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react"; // Import Loader2
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/messages/actions";
import Link from "next/link";
import { toast } from "sonner"; // Assuming sonner is used for toasts

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_user_id: string;
}

interface User {
    id: string;
}

interface ChatInterfaceProps {
    initialMessages: Message[];
    currentUser: User | null;
    conversationId: string;
    otherUser: {
        name: string;
        avatar?: string;
        initial: string;
    };
}

export function ChatInterface({ initialMessages, currentUser, conversationId, otherUser }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Scroll to bottom on updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // Only add if not already present (optimistic update handling)
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || !currentUser) return;

        const content = inputValue.trim();
        setInputValue(""); // Clear immediately
        setIsSending(true);

        // Optimistic Update
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: optimisticId,
            content: content,
            created_at: new Date().toISOString(),
            sender_user_id: currentUser.id
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const result = await sendMessage(conversationId, content);
            if (result.error) {
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticId));
                toast.error("Failed to send message: " + result.error);
                setInputValue(content); // Restore input
            }
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
            toast.error("Failed to send message");
            setInputValue(content);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/messages" className="md:hidden text-stone-500 hover:text-stone-900 mr-2">
                        ←
                    </Link>
                    <Avatar className="h-10 w-10 border border-stone-200">
                        <AvatarImage src={otherUser.avatar} />
                        <AvatarFallback className="bg-stone-100 text-stone-600">{otherUser.initial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-stone-900">{otherUser.name}</h3>
                        <p className="text-xs text-stone-500">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30" ref={scrollRef}>
                <div className="flex flex-col justify-end min-h-full space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-stone-400 py-10">
                            No messages yet. Say hello!
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.sender_user_id === currentUser?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe
                                    ? "bg-moss-600 text-white rounded-br-none"
                                    : "bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm"
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
            <div className="p-4 bg-white border-t border-stone-200 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-stone-50 border-stone-200 focus-visible:ring-moss-500"
                        autoComplete="off"
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" className="bg-moss-600 hover:bg-moss-700 text-white shrink-0" disabled={isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
