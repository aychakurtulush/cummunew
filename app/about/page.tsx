import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl space-y-16">
                {/* Hero */}
                <section className="text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                        Bringing Berlin neighborhoods<br />back to life.
                    </h1>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Communew is a marketplace for local hobby events. We believe that shared activities are the best way to build genuine connections in a big city.
                    </p>
                </section>

                {/* Mission */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                        <Image
                            src="/images/about_mission.jpg"
                            alt="Collage of community activities: pottery, coffee making, painting, yoga, and dining"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-serif font-bold text-stone-900">Our Mission</h2>
                        <p className="text-stone-600 leading-relaxed">
                            Berlin is full of incredibly talented people—potters, bakers, yogis, and artists. Yet, it can be hard to find affordable, local workshops without scrolling through endless social media feeds.
                        </p>
                        <p className="text-stone-600 leading-relaxed">
                            We created Communew to give these local hosts a platform to handle bookings easily, so they can focus on what they do best: teaching and connecting people.
                        </p>
                    </div>
                </section>

                {/* How it works */}
                <section className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-serif font-bold text-stone-900">How it works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
                        <div className="space-y-2">
                            <div className="h-12 w-12 bg-moss-100 text-moss-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">1</div>
                            <h3 className="font-bold text-stone-900">Discover</h3>
                            <p className="text-sm text-stone-500">Find workshops and meetups in your Kiez.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-12 w-12 bg-moss-100 text-moss-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">2</div>
                            <h3 className="font-bold text-stone-900">Book</h3>
                            <p className="text-sm text-stone-500">Secure your spot instantly online.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-12 w-12 bg-moss-100 text-moss-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">3</div>
                            <h3 className="font-bold text-stone-900">Connect</h3>
                            <p className="text-sm text-stone-500">Learn something new and meet neighbors.</p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-12">
                    <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">Ready to join the community?</h2>
                    <div className="flex justify-center gap-4">
                        <Link href="/">
                            <Button size="lg" className="bg-moss-600 hover:bg-moss-700 text-white">Explore Events</Button>
                        </Link>
                        <Link href="/host">
                            <Button size="lg" variant="outline">Start Hosting</Button>
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    )
}
