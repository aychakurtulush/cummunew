"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Calendar, Clock, MessageSquare } from "lucide-react";
import { updateInquiryStatus, deleteInquiry } from "@/app/host/inquiries/actions";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export function InquiryCard({ inquiry }: { inquiry: any }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        setIsLoading(true);
        try {
            const result = await updateInquiryStatus(inquiry.id, status);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Request ${status}`);
            }
        } catch (e) {
            toast.error("Failed to update status");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;

        setIsLoading(true);
        try {
            const result = await deleteInquiry(inquiry.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Inquiry deleted");
            }
        } catch (e) {
            toast.error("Failed to delete inquiry");
        } finally {
            setIsLoading(false);
        }
    };

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800"
    };

    return (
        <Card className="overflow-hidden group">
            <div className="flex flex-col sm:flex-row">
                {/* Left: Info */}
                <div className="flex-1 p-6 relative">
                    {/* Delete Button - Top Right */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-400 hover:text-red-600 hover:bg-red-50"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex justify-between items-start mb-4 pr-10">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-stone-200">
                                <AvatarFallback className="bg-moss-50 text-moss-700">
                                    {inquiry.requester.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-stone-900">{inquiry.requester.name}</h3>
                                <p className="text-xs text-stone-500">Requested {new Date(inquiry.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className={cn("capitalize", statusColors[inquiry.status as keyof typeof statusColors])}>
                            {inquiry.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Calendar className="h-4 w-4 text-stone-400" />
                            <span>{new Date(inquiry.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Clock className="h-4 w-4 text-stone-400" />
                            <span>
                                {new Date(inquiry.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} -
                                {new Date(inquiry.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700 italic border border-stone-100 flex gap-2">
                        <MessageSquare className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                        <p>"{inquiry.message}"</p>
                    </div>
                    <div className="mt-2 text-xs text-stone-400">
                        Request for studio: <span className="font-medium text-stone-600">{inquiry.studio.name}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                {inquiry.status === 'pending' && (
                    <div className="bg-stone-50 border-t sm:border-t-0 sm:border-l border-stone-100 p-6 flex flex-row sm:flex-col justify-center gap-2 min-w-[140px]">
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            size="sm"
                            onClick={() => handleStatusUpdate('approved')}
                            disabled={isLoading}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-stone-600 hover:text-red-600 hover:bg-red-50 border-stone-200"
                            size="sm"
                            onClick={() => handleStatusUpdate('rejected')}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
