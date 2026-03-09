import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CommunityGuidelines() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Community Guidelines</h1>
                <div className="prose prose-stone lg:prose-lg">
                    <p className="lead text-xl text-stone-600 mb-8">
                        Communew is built on trust, respect, and the joy of shared experiences. To keep our community safe, we require all members to follow these guidelines.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">1. Respect and Inclusion</h2>
                    <p className="text-stone-600 mb-4">
                        We welcome people of all backgrounds. Discrimination, hate speech, or harassment of any kind will not be tolerated. Treat every host and guest with the same kindness you&apos;d want for yourself.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">2. Authenticity</h2>
                    <p className="text-stone-600 mb-4">
                        Be yourself. Use your real name and an accurate profile photo. Hosts must provide truthful descriptions and photos of their events and spaces. Misleading or fraudulent listings are strictly prohibited.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">3. Safety First</h2>
                    <p className="text-stone-600 mb-4">
                        Hosts are responsible for ensuring their venues are safe and meet local regulations. Guests must follow house rules and safety instructions provided by the host. If you ever feel unsafe, report the situation immediately.
                    </p>

                    <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">4. Communication</h2>
                    <p className="text-stone-600 mb-4">
                        Use the Communew messaging system for coordination. Keep conversations professional and focused on the event. Protect your private information (like bank details) and only share what&apos;s necessary for the booking.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
