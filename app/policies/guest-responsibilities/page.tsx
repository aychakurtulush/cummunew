import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function GuestResponsibilities() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Guest Responsibilities</h1>
                <div className="prose prose-stone lg:prose-lg">
                    <p className="lead text-xl text-stone-600 mb-8">
                        Being a guest on Communew means joining someone&apos;s space and community. We ask you to be respectful, punctual, and responsible during your visit.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">1. Respect Rules & Space</h2>
                    <p className="text-stone-600 mb-4">
                        Treat the host&apos;s space with respect. Follow all house rules provided in the event description or by the host upon arrival. Leave the space as you found it.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">2. Punctuality & Attendance</h2>
                    <p className="text-stone-600 mb-4">
                        Hosts put significant effort into planning. Arrive on time. If you can no longer attend, notify the host as early as possible. No-shows without notice are disrespectful and may lead to a lower user rating.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">3. Communication</h2>
                    <p className="text-stone-600 mb-4">
                        Keep all communication within the Communew platform. If you have questions about materials, location, or requirements, ask the host through the messaging system before the event starts.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">4. Personal Safety & Conduct</h2>
                    <p className="text-stone-600 mb-4">
                        You are responsible for your own safety and conduct. Communew is only a platform to connect you with hosts. If you encounter any issues or feel unsafe, remove yourself from the situation and report the incident to us.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
