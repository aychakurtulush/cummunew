import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-6">Terms of Service</h1>
                <div className="prose prose-stone">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        Welcome to Communew. By accessing or using our platform, you agree to be bound by these terms.
                    </p>
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
