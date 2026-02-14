'use client';

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ArrowRight, Filter, Plus } from "lucide-react";

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

const FILTER_CATEGORIES = ["All", "Arts & Crafts", "Food & Drink", "Sports & Wellness", "Social & Games", "Language Exchange"];

export function EventExplorer({ initialEvents, isDemo }: { initialEvents: any[], isDemo: boolean }) {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredEvents = selectedCategory === "All"
        ? initialEvents
        : initialEvents.filter(event => (event.category || "General") === selectedCategory);

    return (
        <div className="space-y-12 pb-20">
            {/* Hero & Filters */}
            <section className="bg-gradient-to-b from-white to-stone-50 pt-8 pb-12 border-b border-stone-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="space-y-4 max-w-3xl">
                        <Badge variant="outline" className="bg-white/50 backdrop-blur text-stone-600 border-stone-200">
                            Berlin Community Platform
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.1]">
                            Discover local hobbies <br className="hidden sm:block" />
                            <span className="text-stone-500">in your neighborhood.</span>
                        </h1>
                        <p className="text-stone-600 text-lg sm:text-xl max-w-2xl leading-relaxed">
                            Join workshops, classes, and regular meetups hosted by local studios and passionate neighbors.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="h-10 rounded-full gap-2 border-stone-300 text-stone-700 bg-white hover:bg-stone-50 px-4">
                            <Filter className="h-3.5 w-3.5" />
                            <span>Filters</span>
                        </Button>
                        <div className="h-8 w-px bg-stone-200 mx-2 hidden sm:block" />
                        {FILTER_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`h-10 px-5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                    ? "bg-moss-600 text-white shadow-md shadow-moss-900/10"
                                    : "bg-white text-stone-600 border border-stone-200 hover:border-moss-300 hover:bg-moss-50/50 hover:text-moss-800"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Event Grid */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Upcoming Events</h2>
                            {isDemo && (
                                <Badge variant="outline" className="text-stone-400 border-dashed border-stone-300">Demo Mode</Badge>
                            )}
                        </div>
                        <p className="text-stone-500">Explore what's happening around you.</p>
                    </div>
                    <Link href="/host/events/create">
                        <Button variant="ghost" className="text-moss-700 hover:text-moss-800 hover:bg-moss-50 hidden sm:flex">
                            <Plus className="h-4 w-4 mr-2" /> Host an Event
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {filteredEvents.map((event: any) => (
                        <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                            <article className="flex flex-col h-full">
                                <div className="aspect-[4/3] w-full bg-stone-200 rounded-xl overflow-hidden relative mb-4 shadow-sm border border-stone-100 group-hover:shadow-md transition-all duration-300">
                                    {event.image_url ? (
                                        <img
                                            src={event.image_url}
                                            alt={event.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-sm font-medium group-hover:scale-105 transition-transform duration-500">
                                            [{event.imagePart || event.category || "Event"}]
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md shadow-sm bg-white/90 text-stone-700 border border-stone-200">
                                            {event.category || "General"}
                                        </span>
                                    </div>

                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-white/90 backdrop-blur text-stone-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            View Details
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold uppercase tracking-wider text-moss-700 flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(event.start_time)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-stone-900 leading-tight group-hover:text-moss-700 transition-colors line-clamp-2">
                                        {event.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-stone-500">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span className="truncate">{event.city}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-stone-900">€{event.price}</span>
                                    </div>
                                    <span className="text-sm font-medium text-moss-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                                        Details <ArrowRight className="h-3 w-3" />
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}

                    {filteredEvents.length === 0 && (
                        <div className="col-span-full py-12 text-center text-stone-500">
                            No events found in this category.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
