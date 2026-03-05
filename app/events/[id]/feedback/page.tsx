import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FeedbackForm } from './feedback-form';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) redirect('/login');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/login?redirectTo=/events/${id}/feedback`);

    // Verify booking
    const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .single();

    if (!booking) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Unauthorized</h1>
                    <p className="text-stone-600">You must have a confirmed booking to leave feedback.</p>
                </main>
                <Footer />
            </div>
        );
    }

    // Verify it hasn't been submitted yet
    const { data: existingFeedback } = await supabase
        .from('event_feedback')
        .select('id')
        .eq('event_id', id)
        .eq('guest_id', user.id)
        .single();

    if (existingFeedback) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Thank You!</h1>
                    <p className="text-stone-600">You have already submitted feedback for this event.</p>
                </main>
                <Footer />
            </div>
        );
    }

    const { data: event } = await supabase
        .from('events')
        .select('title')
        .eq('id', id)
        .single();

    if (!event) notFound();

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Event Feedback</h1>
                    <p className="text-stone-600 mb-8">How was your experience at &quot;{event.title}&quot;?</p>
                    <FeedbackForm eventId={id} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
