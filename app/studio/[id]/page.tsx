import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Instagram, Mail } from "lucide-react";
import Link from "next/link";

// Mock Studio Data
async function getStudio(id: string) {
    return {
        id,
        name: "Clay Space Berlin",
        handle: "@clayspace",
        avatar: "/avatars/clay-space.jpg",
        cover: "/images/studio-cover.jpg",
        bio: "We are a community-run pottery studio in Kreuzberg. Our mission is to make ceramics accessible to everyone. We offer courses, memberships, and open studio hours.",
        location: "Oranienstraße 12, 10999 Berlin",
        website: "clayspace.berlin",
        instagram: "clayspace_berlin",
        stats: {
            followers: 1240,
            eventsHosted: 45,
            rating: 4.9,
        },
        upcomingEvents: [
            {
                id: "1",
                title: "Intro to Wheel Throwing",
                date: "Sat, 24 Feb • 14:00",
                price: 45,
                imagePart: "Hands molding clay",
                tags: ["Workshop"],
            },
            {
                id: "7",
                title: "Open Studio Session",
                date: "Sun, 25 Feb • 10:00",
                price: 15,
                imagePart: "Studio shelves",
                tags: ["Self-led"],
            },
            {
                id: "8",
                title: "Glazing Workshop",
                date: "Sat, 02 Mar • 15:00",
                price: 35,
                imagePart: "Colorful glazes",
                tags: ["Intermediate"],
            },
        ]
    };
}

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const studio = await getStudio(id);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Cover Image */}
                <div className="h-64 md:h-80 w-full bg-stone-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-medium">
                        [Studio Cover Image]
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">

                        {/* Avatar */}
                        <Avatar className="h-32 w-32 border-4 border-white shadow-md -mt-16 md:-mt-20 bg-stone-100">
                            <AvatarImage src={studio.avatar} />
                            <AvatarFallback className="text-3xl">{studio.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-serif font-bold text-stone-900">{studio.name}</h1>
                                    <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{studio.location}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline">Follow</Button>
                                    <Button>Contact</Button>
                                </div>
                            </div>

                            <p className="text-stone-600 max-w-2xl leading-relaxed">
                                {studio.bio}
                            </p>

                            <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors">
                                    <Globe className="h-4 w-4" />
                                    <span className="font-medium underline decoration-stone-300 underline-offset-4">{studio.website}</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors">
                                    <Instagram className="h-4 w-4" />
                                    <span className="font-medium">{studio.instagram}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content Area */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

                    {/* Upcoming Events */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif font-bold text-stone-900">Upcoming Events</h2>
                            <Button variant="link" className="text-moss-600">View Calendar</Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studio.upcomingEvents.map((event) => (
                                <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                                    <Card className="h-full cursor-pointer overflow-hidden border-stone-200 bg-white hover:border-moss-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-[3/2] w-full bg-stone-200 relative">
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">
                                                [{event.imagePart}]
                                            </div>
                                            <Badge className="absolute top-3 left-3 bg-white/90 text-stone-900 shadow-sm">{event.tags[0]}</Badge>
                                        </div>
                                        <CardHeader className="p-4 pb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-moss-700">{event.date}</span>
                                            <CardTitle className="text-lg mt-1">{event.title}</CardTitle>
                                        </CardHeader>
                                        <CardFooter className="p-4 pt-2 border-t border-stone-100 mt-auto">
                                            <span className="font-semibold text-stone-900">€{event.price}</span>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>

                </div>

            </main>
            <Footer />
        </div>
    );
}
