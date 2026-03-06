"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ReviewPage() {
    const { bookingId } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [booking, setBooking] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        async function fetchBooking() {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    events (
                        id,
                        title,
                        profiles:creator_user_id (full_name)
                    )
                `)
                .eq('id', bookingId)
                .single();

            if (error || !data) {
                toast.error("Booking not found or already reviewed.");
                router.push('/');
                return;
            }

            setBooking(data);
            setLoading(false);
        }
        fetchBooking();
    }, [bookingId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('event_reviews')
                .insert({
                    event_id: booking.events.id,
                    booking_id: booking.id,
                    rating,
                    comment
                });

            if (error) throw error;

            setSubmitted(true);
            toast.success("Thank you for your feedback!");
            setTimeout(() => router.push('/bookings'), 3000);
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="h-8 w-8 animate-spin text-moss-600" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <CheckCircle2 className="h-16 w-16 text-moss-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Thank You!</h1>
                    <p className="text-stone-600 mb-6">Your feedback helps keep Communew's high standards.</p>
                    <Button onClick={() => router.push('/bookings')} className="bg-moss-600 hover:bg-moss-700">
                        Back to My Bookings
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="max-w-md mx-auto">
                <Card className="border-stone-200 shadow-xl overflow-hidden">
                    <div className="bg-moss-900 p-8 text-white text-center">
                        <h2 className="text-sm uppercase tracking-widest font-bold opacity-70 mb-2">Review Your Experience</h2>
                        <h1 className="text-2xl font-serif font-bold">{booking.events.title}</h1>
                        <p className="text-moss-200 mt-2 italic">Hosted by {booking.events.profiles?.full_name || "a lovely host"}</p>
                    </div>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="text-center">
                                <label className="block text-sm font-bold text-stone-700 mb-4 uppercase tracking-wider">How was it?</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={`h-10 w-10 ${(hoveredRating || rating) >= star
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-stone-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-stone-400">
                                    {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Great"}
                                    {rating === 5 && "Excellent"}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider">Comment (Optional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about the atmosphere, the host, or anything else..."
                                    className="w-full h-32 p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-moss-500 focus:border-transparent resize-none text-sm"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 text-lg font-serif font-bold shadow-lg shadow-stone-200"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Submit Review
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
