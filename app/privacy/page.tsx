import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-6">Privacy Policy</h1>
                <div className="prose prose-stone">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        At Communew, we take your privacy seriously. This is a demo application, but in a real-world scenario,
                        this page would outline how we collect, use, and protect your personal information.
                    </p>
                    <h3>1. Data Collection</h3>
                    <p>We collect data you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
