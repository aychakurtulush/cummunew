import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Scale, Users, Home, UserCheck } from "lucide-react";

const policyLinks = [
    {
        title: "Terms of Service",
        href: "/terms",
        description: "The fundamental rules for using the Communew platform.",
        icon: Scale
    },
    {
        title: "Privacy Policy",
        href: "/privacy",
        description: "How we collect, use, and protect your personal data.",
        icon: ShieldCheck
    },
    {
        title: "Community Guidelines",
        href: "/policies/community-guidelines",
        description: "Our standards for inclusion, respect, and authenticity.",
        icon: Users
    },
    {
        title: "Host Responsibilities",
        href: "/policies/host-responsibilities",
        description: "Obligations for safety, accuracy, and professional hosting.",
        icon: Home
    },
    {
        title: "Guest Responsibilities",
        href: "/policies/guest-responsibilities",
        description: "Expectations for punctuality, respect, and conduct.",
        icon: UserCheck
    }
];

export default function PoliciesDirectory() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4 text-center">Trust & Safety Center</h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                        We are committed to building a safe and professional creative community.
                        Please review our policies to understand your rights and responsibilities.
                    </p>
                    <div className="h-1 w-20 bg-moss-600 mx-auto mt-6"></div>
                </header>

                <div className="grid gap-6 sm:grid-cols-2">
                    {policyLinks.map((policy) => (
                        <Link
                            key={policy.href}
                            href={policy.href}
                            className="group p-6 bg-white border border-stone-200 rounded-xl hover:border-moss-300 hover:shadow-sm transition-all duration-300 flex items-start gap-4"
                        >
                            <div className="p-3 bg-stone-50 rounded-lg group-hover:bg-moss-50 transition-colors">
                                <policy.icon className="w-6 h-6 text-stone-600 group-hover:text-moss-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-serif font-bold text-stone-900 mb-1 flex items-center gap-2">
                                    {policy.title}
                                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-moss-500" />
                                </h2>
                                <p className="text-stone-500 text-sm leading-relaxed">
                                    {policy.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 p-8 bg-stone-900 rounded-2xl text-white">
                    <h3 className="text-2xl font-serif font-bold mb-4">Need to report an issue?</h3>
                    <p className="text-stone-300 mb-6 leading-relaxed max-w-xl">
                        Our moderation team is here to help maintain community standards.
                        If you experience harassment, safety issues, or profile fraud,
                        please use the report buttons on the platform.
                    </p>
                    <Link
                        href="/messages"
                        className="inline-flex items-center px-6 py-3 bg-moss-600 hover:bg-moss-500 text-white font-medium rounded-full transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
