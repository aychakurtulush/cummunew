import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Send } from "lucide-react";

// Mock Conversations
const MOCK_CHATS = [
    { id: 1, name: "Clay Space Berlin", lastMessage: "See you on Saturday! Bring an apron if you have one.", time: "2h ago", unread: true, initial: "C" },
    { id: 2, name: "Cucina Maria", lastMessage: "The recipe cards will be provided.", time: "1d ago", unread: false, initial: "M" },
    { id: 3, name: "Urban Zen", lastMessage: "Thanks for booking!", time: "3d ago", unread: false, initial: "U" },
];

export default function MessagesPage() {
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
                    {MOCK_CHATS.map((chat) => (
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
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-stone-50/30">
                {/* Header */}
                <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-white">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-moss-100 text-moss-700">C</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-sm font-bold text-stone-900">Clay Space Berlin</h3>
                        <p className="text-xs text-stone-500">Replies typically in 1 hour</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="flex justify-center">
                        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">Today, 10:23 AM</span>
                    </div>

                    <div className="flex justify-end">
                        <div className="bg-moss-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[80%] shadow-sm">
                            Hi! Do I need to bring my own tools for the wheel throwing class?
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <div className="bg-white border border-stone-200 text-stone-700 rounded-2xl rounded-tl-sm px-4 py-2 text-sm max-w-[80%] shadow-sm">
                            See you on Saturday! Bring an apron if you have one, but we have tools here.
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-stone-200">
                    <div className="flex gap-2">
                        <Input placeholder="Type a message..." className="flex-1 bg-stone-50 border-stone-200" />
                        <Button size="icon" className="bg-moss-600 hover:bg-moss-700 text-white">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
