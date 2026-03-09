import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Heart, Users, MapPin, ShieldCheck, Star, Sparkles } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
                {/* Hero section with premium feel */}
                <section className="bg-stone-900 py-24 px-6 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-moss-500/20 via-transparent to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-moss-900/50 border border-moss-500/30 rounded-full text-moss-300 text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> Since 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight">
                            Bringing Berlin neighborhoods<br />back to life.
                        </h1>
                        <p className="text-xl md:text-2xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light font-serif italic">
                            &quot;Shared activities are the heartbeat of genuine urban connection.&quot;
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 px-6 md:px-12 lg:px-24">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">Our Shared Vision</h2>
                            <p className="text-lg text-stone-600 leading-relaxed">
                                Berlin is a tapestry of infinite talent—from master ceramics artists in Neukölln to sourdough
                                revolutionaries in Prenzlauer Berg. Yet, in our digital age, finding these local keepers
                                of craft often feels like searching for a needle in a haystack of social media noise.
                            </p>
                            <p className="text-lg text-stone-600 leading-relaxed">
                                <strong>Communew</strong> was built to empower these creators. We provide the infrastructure
                                so they can focus on their passion, while neighbors like you can discover and book
                                transformative experiences just blocks from your front door.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 text-stone-900 font-medium">
                                    <MapPin className="w-5 h-5 text-moss-600" />
                                    <span>Hyper-local</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-900 font-medium">
                                    <Heart className="w-5 h-5 text-moss-600" />
                                    <span>Human-centric</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-900 font-medium">
                                    <ShieldCheck className="w-5 h-5 text-moss-600" />
                                    <span>Trust-built</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <Image
                                src="/images/about_mission.jpg"
                                alt="Community at Communew"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Values / Why Us */}
                <section className="bg-stone-100 py-24 px-6">
                    <div className="max-w-6xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-serif font-bold text-stone-900">Why Communew?</h2>
                            <p className="text-stone-600 max-w-xl mx-auto">
                                We aren&apos;t just a booking site. We are a community platform designed with
                                safety and connection at its core.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Verified Hosts",
                                    desc: "Every host completes a rigorous profile verification before they can publish events.",
                                    icon: Star
                                },
                                {
                                    title: "Safe Spaces",
                                    desc: "We prioritize physical studios and verified locations to ensure your creative safety.",
                                    icon: ShieldCheck
                                },
                                {
                                    title: "Authentic Connection",
                                    desc: "Small-group events ensure you actually meet your neighbors, not just attend a class.",
                                    icon: Users
                                }
                            ].map((value, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl border border-stone-200 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-moss-50 text-moss-600 rounded-xl flex items-center justify-center">
                                        <value.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-stone-900">{value.title}</h3>
                                    <p className="text-stone-500 leading-relaxed text-sm">
                                        {value.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Safety / Protection Callout - Addressing user concern */}
                <section className="py-24 px-6 max-w-4xl mx-auto text-center space-y-12">
                    <div className="inline-flex items-center gap-2 p-4 bg-moss-50 rounded-2xl border border-moss-200">
                        <ShieldCheck className="w-8 h-8 text-moss-700" />
                        <div className="text-left">
                            <h3 className="font-bold text-stone-900 uppercase tracking-tighter text-sm">Our Safety Promise</h3>
                            <p className="text-xs text-stone-600">Secure data. Verified people. Professional standards.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-serif font-bold text-stone-900">Professional Protection for Everyone</h2>
                        <p className="text-lg text-stone-600 leading-relaxed">
                            Whether you are hosting for the first time or booking your tenth workshop,
                            our robust legal framework and community guidelines are designed to
                            protect your data, your space, and your safety.
                        </p>
                        <div className="flex justify-center flex-wrap gap-4">
                            <Link href="/policies" className="text-moss-600 font-semibold underline underline-offset-4 hover:text-moss-700 transition-colors">
                                Trust & Safety Center
                            </Link>
                            <span className="text-stone-300">|</span>
                            <Link href="/terms" className="text-stone-600 font-medium hover:text-stone-900 transition-colors">
                                Professional Terms
                            </Link>
                            <span className="text-stone-300">|</span>
                            <Link href="/privacy" className="text-stone-600 font-medium hover:text-stone-900 transition-colors">
                                Data Security
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-moss-900 py-24 px-6 text-center text-white">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl font-serif font-bold">Experience the neighborly side of Berlin.</h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/">
                                <Button size="lg" className="h-14 px-8 bg-white text-moss-900 hover:bg-stone-100 rounded-full font-bold">
                                    Explore Experiences
                                </Button>
                            </Link>
                            <Link href="/host">
                                <Button size="lg" variant="outline" className="h-14 px-8 border-moss-400 text-moss-100 hover:bg-moss-800 rounded-full font-bold">
                                    Become a Host
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
