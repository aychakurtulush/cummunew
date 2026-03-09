import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HostResponsibilities() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Host Responsibilities</h1>
                <div className="prose prose-stone lg:prose-lg">
                    <p className="lead text-xl text-stone-600 mb-8">
                        As a host on Communew, you are the heart of our community. You are responsible for the safety, quality, and legal compliance of every event you organize.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">1. Event Accuracy</h2>
                    <p className="text-stone-600 mb-4">
                        Provide a clear and truthful description of your event. If the event details change (time, location, activities), you must notify all confirmed guests immediately through the platform.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">2. Venue Safety & Legality</h2>
                    <p className="text-stone-600 mb-4">
                        Ensure your venue (studio, home, or public space) is safe, clean, and has the necessary permissions. You are responsible for complying with local laws, including noise ordinances, permits, and business licenses where applicable.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">3. Communication & Booking</h2>
                    <p className="text-stone-600 mb-4">
                        Respond to booking requests and messages in a timely manner. Approve or decline guests promptly so they can plan their schedules. If you cancel an event, you must provide a full refund (if payment was taken) and an explanation.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">4. Personal Responsibility</h2>
                    <p className="text-stone-600 mb-4">
                        Communew is a platform for connection, not a service provider. You understand that you are solely responsible for interactions with guests. Communew does not provide insurance or assume liability for incidents that occur during events.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
