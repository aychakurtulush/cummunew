"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ArrowRight, Filter, Plus } from "lucide-react";
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
const formatDate = (dateString: string | undefined, locale: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    const resolvedLocale = locale === 'de' ? 'de-DE' : 'en-DE';
    return new Intl.DateTimeFormat(resolvedLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

const FILTER_CATEGORIES = ["All", "Arts & Crafts", "Food & Drink", "Sports & Wellness", "Social & Games", "Language Exchange", "Music & Performance", "Learning & Tech", "Outdoors & Nature", "Kids & Family", "Community & Volunteering", "Other"];

import { WishlistButton } from "@/components/event/wishlist-button";
import { Map as MapIcon, Grid as GridIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';

const EventsMap = dynamic(() => import('@/components/event/events-map').then(mod => mod.EventsMap), {
    ssr: false,
    loading: () => <div className="w-full h-[600px] rounded-2xl bg-stone-100 flex items-center justify-center animate-pulse"><p className="text-stone-400">Loading Map...</p></div>
});

export function EventExplorer({ initialEvents, isDemo, wishlistEventIds = [], mapboxToken }: { initialEvents: any[], isDemo: boolean, wishlistEventIds?: string[], mapboxToken?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations('home.explore');
    const locale = useLocale();

    const selectedCategory = searchParams.get("category") || "All";
    const priceFilter = searchParams.get("price") || "any";
    const dateFilter = searchParams.get("date") || "any";

    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "any" || (key === "category" && value === "All")) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}#events-explorer`, { scroll: false });
    };

    const filteredEvents = initialEvents; // Server already filtered them

    const activeFilterCount = (priceFilter !== "any" ? 1 : 0) + (dateFilter !== "any" ? 1 : 0);



    return (
        <div id="events-explorer" className="space-y-8 py-12">
            {/* Filters */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-100 pb-8">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-serif font-bold text-stone-900">{t('title')}</h2>
                        <p className="text-stone-500">{t('subtitle')}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-10 rounded-full gap-2 border-stone-300 px-5 transition-colors ${activeFilterCount > 0 ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white text-stone-700 hover:bg-stone-50'}`}
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    <span>{t('filters')}</span>
                                    {activeFilterCount > 0 && (
                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold ml-1">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>{t('price')}</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuCheckboxItem checked={priceFilter === "any"} onCheckedChange={() => updateFilters({ price: "any" })}>
                                        {t('anyPrice')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={priceFilter === "free"} onCheckedChange={() => updateFilters({ price: "free" })}>
                                        {t('free')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={priceFilter === "under-20"} onCheckedChange={() => updateFilters({ price: "under-20" })}>
                                        {t('under20')}
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{t('date')}</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuCheckboxItem checked={dateFilter === "any"} onCheckedChange={() => updateFilters({ date: "any" })}>
                                        {t('anyDate')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={dateFilter === "today"} onCheckedChange={() => updateFilters({ date: "today" })}>
                                        {t('today')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={dateFilter === "this-weekend"} onCheckedChange={() => updateFilters({ date: "this-weekend" })}>
                                        {t('thisWeekend')}
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{t('difficulty')}</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("difficulty") === "any" || !searchParams.get("difficulty")} onCheckedChange={() => updateFilters({ difficulty: "any" })}>
                                        {t('anyLevel')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("difficulty") === "beginner"} onCheckedChange={() => updateFilters({ difficulty: "beginner" })}>
                                        {t('beginner')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("difficulty") === "intermediate"} onCheckedChange={() => updateFilters({ difficulty: "intermediate" })}>
                                        {t('intermediate')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("difficulty") === "advanced"} onCheckedChange={() => updateFilters({ difficulty: "advanced" })}>
                                        {t('advanced')}
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{t('ageRange')}</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("age") === "any" || !searchParams.get("age")} onCheckedChange={() => updateFilters({ age: "any" })}>
                                        {t('anyAge')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("age") === "adults"} onCheckedChange={() => updateFilters({ age: "adults" })}>
                                        {t('adults')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("age") === "teens"} onCheckedChange={() => updateFilters({ age: "teens" })}>
                                        {t('teens')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("age") === "kids"} onCheckedChange={() => updateFilters({ age: "kids" })}>
                                        {t('kids')}
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={searchParams.get("age") === "family"} onCheckedChange={() => updateFilters({ age: "family" })}>
                                        {t('family')}
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                                {(activeFilterCount > 0) && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600 cursor-pointer justify-center font-medium"
                                            onSelect={() => {
                                                updateFilters({ price: "any", date: "any", difficulty: "any", age: "any" });
                                            }}
                                        >
                                            {t('resetFilters')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-8 w-px bg-stone-200 mx-2 hidden sm:block" />

                        {FILTER_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => updateFilters({ category: cat })}
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
            </div>

            {/* Event Grid */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">{t('upcomingEvents')}</h2>
                            {isDemo && (
                                <Badge variant="outline" className="text-stone-400 border-dashed border-stone-300">{t('demoMode')}</Badge>
                            )}
                        </div>
                        <p className="text-stone-500">
                            {t('showing')} {filteredEvents.length} {filteredEvents.length === 1 ? t('event') : t('events')}
                            {selectedCategory !== "All" && ` ${t('in')} ${selectedCategory}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/host/events/create">
                            <Button variant="ghost" className="text-moss-700 hover:text-moss-800 hover:bg-moss-50 hidden sm:flex">
                                <Plus className="h-4 w-4 mr-2" /> {t('hostEvent')}
                            </Button>
                        </Link>
                        {mapboxToken && (
                            <div className="bg-stone-100 p-1 rounded-lg flex items-center border border-stone-200">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <GridIcon className="h-4 w-4" /> {t('grid')}
                                </button>
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'map' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <MapIcon className="h-4 w-4" /> {t('map')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {viewMode === "map" && mapboxToken ? (
                    <EventsMap events={filteredEvents} mapboxToken={mapboxToken} />
                ) : (
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
                                                {t('viewDetails')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold uppercase tracking-wider text-moss-700 flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(event.start_time, locale)}
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
                                            {t('details')} <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}

                        {filteredEvents.length === 0 && (
                            <div className="col-span-full py-24 text-center">
                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="relative mx-auto w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                        <Filter className="h-10 w-10 text-stone-300" />
                                        <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Badge variant="outline" className="text-[10px] p-0 px-1 border-stone-200">0</Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-serif font-bold text-stone-900">{t('noEventsFound')}</h3>
                                        <p className="text-stone-500">
                                            {t('noEventsDesc')}
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            onClick={() => {
                                                const params = new URLSearchParams();
                                                router.push(`${pathname}?${params.toString()}#events-explorer`);
                                            }}
                                            className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-8"
                                        >
                                            {t('clearAllFilters')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
