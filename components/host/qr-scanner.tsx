"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scan, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toggleAttendance } from "@/app/host/events/actions";
import { toast } from "sonner";

export function QRScanner({ eventId }: { eventId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scannedResult, setScannedResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            // Give the dialog content a moment to mount the 'reader' div
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
            }, 500);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                    scannerRef.current = null;
                }
            };
        }
    }, [isOpen]);

    async function onScanSuccess(decodedText: string) {
        if (isProcessing) return;

        try {
            const data = JSON.parse(decodedText);

            if (data.type === "communew-ticket" && data.bookingId) {
                setIsProcessing(true);
                // Pause scanner or at least don't re-process

                const result = await toggleAttendance(data.bookingId, true);

                if (result.success) {
                    setScannedResult({ success: true, message: "Guest Checked In!" });
                    toast.success("Check-in successful");
                } else {
                    setScannedResult({ success: false, message: result.error || "Check-in failed" });
                    toast.error(result.error || "Check-in failed");
                }
            } else {
                toast.error("Invalid Ticket");
            }
        } catch (e) {
            console.error("Scan error:", e);
        } finally {
            // Allow re-scanning after a short delay
            setTimeout(() => setIsProcessing(false), 2000);
            setTimeout(() => setScannedResult(null), 3000);
        }
    }

    function onScanFailure(error: any) {
        // This is called constantly when no QR code is in view
        // console.warn(`Code scan error = ${error}`);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-stone-900 hover:bg-stone-800 text-white gap-2">
                    <Scan className="h-4 w-4" />
                    Scan Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Participant Ticket</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <div id="qr-reader" className="w-full border-none rounded-xl overflow-hidden shadow-inner bg-stone-50"></div>

                    {isProcessing && (
                        <div className="flex items-center gap-2 text-moss-600 font-medium animate-pulse">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Verifying Ticket...
                        </div>
                    )}

                    {scannedResult && (
                        <div className={`flex items-center gap-2 font-bold p-3 rounded-lg w-full justify-center ${scannedResult.success ? 'bg-moss-50 text-moss-700' : 'bg-red-50 text-red-700'}`}>
                            {scannedResult.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            {scannedResult.message}
                        </div>
                    )}

                    <p className="text-sm text-stone-500 text-center">
                        Hold the guest's QR code up to your camera to automatically check them in.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
