'use client';

import { useState } from 'react';
import { submitFeedback } from './actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function FeedbackForm({ eventId }: { eventId: string }) {
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await submitFeedback(eventId, rating, comment);

        if (result.error) {
            toast.error(result.error);
            setIsSubmitting(false);
        } else {
            toast.success("Feedback submitted! Thank you.");
            setSubmitted(true);
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-moss-100 text-moss-600 rounded-full flex items-center justify-center mb-4 text-3xl">🌿</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Thank you!</h3>
                <p className="text-stone-600 text-sm">Your feedback helps our community grow.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-colors ${rating >= star ? 'text-amber-500' : 'text-stone-200 hover:text-stone-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-stone-700 mb-2">
                    What did you enjoy? What could be better? (Optional)
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-lg border-stone-200 border p-3 focus:ring-moss-600 focus:border-moss-600"
                    placeholder="Share your thoughts..."
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-moss-700 hover:bg-moss-800 text-white shadow">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
        </form>
    );
}
