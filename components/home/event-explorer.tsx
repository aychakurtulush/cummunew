import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ArrowRight, Filter, Plus, Check } from "lucide-react";
import { AtmosphereBackground } from "@/components/ui/atmosphere-background";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

const FILTER_CATEGORIES = ["All", "Arts & Crafts", "Food & Drink", "Sports & Wellness", "Social & Games", "Language Exchange"];

import { WishlistButton } from "@/components/event/wishlist-button";

export function EventExplorer({ initialEvents, isDemo, wishlistEventIds = [] }: { initialEvents: any[], isDemo: boolean, wishlistEventIds?: string[] }) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [priceFilter, setPriceFilter] = useState<"any" | "free" | "under-20">("any");
    const [dateFilter, setDateFilter] = useState<"any" | "today" | "this-weekend">("any");

    const filteredEvents = initialEvents.filter(event => {
        // 1. Category Filter
        if (selectedCategory !== "All" && (event.category || "General") !== selectedCategory) {
            return false;
        }

        // 2. Price Filter
        if (priceFilter === "free" && event.price > 0) return false;
        if (priceFilter === "under-20" && event.price >= 20) return false;

        // 3. Date Filter
        if (dateFilter !== "any") {
            const eventDate = new Date(event.start_time);
            const today = new Date();
            const isToday = eventDate.toDateString() === today.toDateString();

            if (dateFilter === "today" && !isToday) return false;

            if (dateFilter === "this-weekend") {
                // Simple weekend logic: Friday evening to Sunday night
                const day = eventDate.getDay(); // 0 is Sunday, 6 is Saturday, 5 is Friday
                const diff = eventDate.getDate() - today.getDate();
                // This is a naive check, for production use date-fns or similar
                // For now, let's just assume "weekend" means upcoming Friday/Saturday/Sunday
                const isWeekendDay = day === 0 || day === 6 || day === 5;
                // Ensure it's active or future
                if (!isWeekendDay || eventDate < today) return false;
            }
        }

        return true;
    });

    const activeFilterCount = (priceFilter !== "any" ? 1 : 0) + (dateFilter !== "any" ? 1 : 0);

    return (
        <div className="space-y-12 pb-20">
            {/* Hero & Filters */}
            <section className="relative bg-stone-50/50 pt-12 pb-16 border-b border-stone-200 overflow-hidden">
                <AtmosphereBackground intensity="medium" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
                    <div className="space-y-6 max-w-3xl">
                        <Badge variant="outline" className="bg-white/50 backdrop-blur text-stone-600 border-stone-200 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                            Berlin Community Platform
                        </Badge>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.05]">
                            Find your people.
                        </h1>
                        <p className="text-stone-600 text-lg sm:text-xl max-w-2xl leading-relaxed">
                            Discover the local community where you belong. Join workshops, classes, and gatherings hosted by neighbors who share your passions.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-10 rounded-full gap-2 border-stone-300 px-5 transition-colors ${activeFilterCount > 0 ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white text-stone-700 hover:bg-stone-50'}`}
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold ml-1">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Price</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuCheckboxItem checked={priceFilter === "any"} onCheckedChange={() => setPriceFilter("any")}>
                                        Any Price
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={priceFilter === "free"} onCheckedChange={() => setPriceFilter("free")}>
                                        Free
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={priceFilter === "under-20"} onCheckedChange={() => setPriceFilter("under-20")}>
                                        Under €20
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Date</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuCheckboxItem checked={dateFilter === "any"} onCheckedChange={() => setDateFilter("any")}>
                                        Any Date
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={dateFilter === "today"} onCheckedChange={() => setDateFilter("today")}>
                                        Today
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={dateFilter === "this-weekend"} onCheckedChange={() => setDateFilter("this-weekend")}>
                                        This Weekend
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                                {(activeFilterCount > 0) && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600 cursor-pointer justify-center font-medium"
                                            onSelect={() => {
                                                setPriceFilter("any");
                                                setDateFilter("any");
                                            }}
                                        >
                                            Reset Filters
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-8 w-px bg-stone-200 mx-2 hidden sm:block" />

                        {FILTER_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`h-10 px-5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                    ? "bg-moss-700 text-white shadow-md shadow-moss-900/10"
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
                        <p className="text-stone-500">
                            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                            {selectedCategory !== "All" && ` in ${selectedCategory}`}
                        </p>
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

                                    <div className="absolute top-3 right-3 z-20">
                                        <WishlistButton
                                            eventId={event.id}
                                            initialIsLiked={wishlistEventIds.includes(event.id)}
                                        />
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
                            No events found matching your filters.
                            <div className="mt-4">
                                <Button variant="link" onClick={() => {
                                    setSelectedCategory("All");
                                    setPriceFilter("any");
                                    setDateFilter("any");
                                }}>
                                    Clear all filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
