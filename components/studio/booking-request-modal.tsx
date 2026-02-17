"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createInquiry } from "@/app/host/inquiries/actions"; // We'll create this

interface BookingRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    studioId: string;
    studioName: string;
}

export function BookingRequestModal({ isOpen, onClose, studioId, studioName }: BookingRequestModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [isLoading, setIsLoading] = useState(false);

    // Form State
    // Using strings for native date inputs is easiest for MVP
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Combine date + time
        // validation
        if (!date || !startTime || !endTime) {
            toast.error("Please fill in all date/time fields");
            setIsLoading(false);
            return;
        }

        const startISO = new Date(`${date}T${startTime}`).toISOString();
        const endISO = new Date(`${date}T${endTime}`).toISOString();

        try {
            const result = await createInquiry({
                studioId,
                startTime: startISO,
                endTime: endISO,
                message
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Request sent successfully!");
                onClose();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
                    <h2 className="text-lg font-bold text-stone-900 font-serif">Request to Book</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-moss-50 border border-moss-100 rounded-lg p-3 text-sm text-moss-800 mb-4">
                        Requesting <strong>{studioName}</strong>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                            <Input
                                type="date"
                                className="pl-9"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">Start Time</label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">End Time</label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700">Message to Host</label>
                        <Textarea
                            placeholder="Tell the host about your event plans..."
                            className="min-h-[100px] resize-none"
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2 flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-moss-600 hover:bg-moss-700 text-white" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Send Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
