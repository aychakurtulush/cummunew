"use client";

import { QRCodeSVG } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin, Download } from "lucide-react";
import { formatEventDate } from "@/lib/date-utils";

interface TicketModalProps {
    booking: {
        id: string;
        events: {
            title: string;
            city: string;
            start_time: string;
        };
    };
    userName?: string;
}

export function TicketModal({ booking, userName }: TicketModalProps) {
    const ticketData = JSON.stringify({
        bookingId: booking.id,
        type: "communew-ticket"
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-moss-200 text-moss-700 hover:bg-moss-50">
                    <Ticket className="h-4 w-4" />
                    View Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-stone-50 border-none p-0 overflow-hidden">
                <div className="bg-moss-700 p-6 text-white text-center">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-white text-center">Your Ticket</DialogTitle>
                    </DialogHeader>
                    <p className="text-moss-100 text-sm mt-1">Present this QR code at the entrance</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* QR Code Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center">
                        <QRCodeSVG
                            value={ticketData}
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="rounded-lg"
                        />
                        <div className="mt-4 text-center">
                            <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">Booking ID</p>
                            <p className="text-sm font-bold text-stone-900">{booking.id.slice(0, 8)}...{booking.id.slice(-4)}</p>
                        </div>
                    </div>

                    {/* Event Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-stone-100 p-2 rounded-lg">
                                <Calendar className="h-5 w-5 text-stone-600" />
                            </div>
                            <div>
                                <p className="text-xs text-stone-500 uppercase font-bold tracking-tight">When</p>
                                <p className="text-stone-900 font-medium">{formatEventDate(booking.events.start_time, 'EEEE, d MMMM')}</p>
                                <p className="text-sm text-stone-500">{formatEventDate(booking.events.start_time, 'HH:mm')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-stone-100 p-2 rounded-lg">
                                <MapPin className="h-5 w-5 text-stone-600" />
                            </div>
                            <div>
                                <p className="text-xs text-stone-500 uppercase font-bold tracking-tight">Where</p>
                                <p className="text-stone-900 font-medium">{booking.events.city}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white gap-2 h-12 rounded-xl" onClick={() => window.print()}>
                            <Download className="h-4 w-4" />
                            Download Ticket
                        </Button>
                    </div>
                </div>

                {/* Decorative cutouts for ticket look */}
                <div className="absolute top-1/3 -left-4 w-8 h-8 bg-stone-100 rounded-full border border-stone-200"></div>
                <div className="absolute top-1/3 -right-4 w-8 h-8 bg-stone-100 rounded-full border border-stone-200"></div>
            </DialogContent>
        </Dialog>
    );
}
