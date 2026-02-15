import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/host/events">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900">Edit Event</h1>
                    <p className="text-stone-500">Update event details.</p>
                </div>
            </div>

            <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
                <p className="text-stone-500">Edit functionality coming soon!</p>
                <p className="text-sm text-stone-400 mt-2">For now, you can delete and recreate the event if needed.</p>
            </div>
        </div>
    );
}
