import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MapPin, Globe, Users, CalendarPlus, Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StudioActions } from "@/components/studio/studio-actions";
import { ReportButton } from "@/components/shared/report-button";
import { formatEventDate } from "@/lib/date-utils";
import { ImageGallery } from "@/components/shared/image-gallery";
import { getTranslations } from 'next-intl/server';

async function getStudio(id: string) {
    const supabase = await createClient();

    if (!supabase) return null;

    const { data: studio, error } = await supabase
        .from('studios')
        .select('*')
        .eq('id', id)
        .single();

    if (!studio || error) return null;

    // Fetch studio events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('studio_id', id)
        .eq('status', 'approved');

    // Check if current user is owner
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === studio.owner_user_id;

    return {
        ...studio,
        upcomingEvents: events || [],
        isOwner,
        isAuthenticated: !!user
    };
}

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const studio = await getStudio(id);
    const t = await getTranslations('studio');
    const tCommon = await getTranslations('common');

    if (!studio) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Photo Gallery */}
                <div className="bg-stone-900 px-4 sm:px-6 lg:px-8 pt-6 pb-0">
                    <div className="container mx-auto">
                        <ImageGallery images={studio.images || []} alt={studio.name} />
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
                    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-6 md:p-8 flex flex-col gap-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                            {/* Avatar */}
                            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white shadow-lg bg-stone-100 shrink-0">
                                <AvatarImage src={studio.avatar_url} />
                                <AvatarFallback className="text-3xl bg-moss-50 text-moss-700 font-serif">
                                    {studio.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Title & Actions */}
                            <div className="flex-1 w-full pt-2">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
                                            {studio.name}
                                        </h1>
                                        <div className="flex items-center gap-4 text-stone-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 text-moss-600" />
                                                <span>{studio.location || "Berlin"}</span>
                                            </div>
                                            {studio.capacity && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4 text-moss-600" />
                                                    <span>Up to {studio.capacity} (standing)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <StudioActions
                                        studioId={studio.id}
                                        studioName={studio.name}
                                        isOwner={studio.isOwner}
                                        ownerId={studio.owner_user_id}
                                        hasAuth={studio.isAuthenticated}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Column: Description & Amenities */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold text-stone-900 font-serif">{t('aboutSpace')}</h2>
                                    <p className="text-stone-600 leading-relaxed text-lg">
                                        {studio.description || t('noDescription')}
                                    </p>
                                </section>

                                {studio.amenities && studio.amenities.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold text-stone-900 font-serif">{t('amenities')}</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {studio.amenities.map((amenity: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 bg-stone-100 text-stone-700 hover:bg-stone-200">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {studio.features && studio.features.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold text-stone-900 font-serif">{t('features')}</h2>
                                        <div className="grid grid-cols-2 gap-3">
                                            {studio.features.map((feature: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-stone-600">
                                                    <Check className="h-4 w-4 text-moss-600" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {studio.space_rules && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold text-stone-900 font-serif">{t('spaceRules')}</h2>
                                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-6 text-stone-600 leading-relaxed whitespace-pre-wrap">
                                            {studio.space_rules}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Right Column: Pricing & Info */}
                            <div className="space-y-6">
                                <div className="bg-stone-50 rounded-xl p-6 space-y-4 border border-stone-100">
                                    <h3 className="font-semibold text-stone-900">{t('rentalRates')}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-stone-900">€{studio.price_per_hour}</span>
                                        <span className="text-stone-500">{t('perHour')}</span>
                                    </div>
                                    <div className="text-sm text-stone-500 space-y-2">
                                        <p>• {t('minimumBooking')}</p>
                                        <p>• {t('cleaningFee')}</p>
                                    </div>

                                    <Separator />

                                    <div className="text-xs text-stone-500">
                                        <span className="font-semibold text-stone-900 block mb-1">{t('cancellationPolicy')}</span>
                                        {t('cancellationText')}
                                    </div>
                                </div>

                                {studio.website && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <Globe className="h-4 w-4" />
                                        <a href={studio.website} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-moss-700 truncate">
                                            {studio.website}
                                        </a>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-stone-100 flex justify-center">
                                    <ReportButton
                                        targetId={studio.id}
                                        targetType="studio"
                                        buttonText={t('reportStudio')}
                                        className="text-stone-400 hover:text-red-600 hover:bg-red-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Availability Section */}
                    <div className="mt-12 p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <CalendarPlus className="h-5 w-5 text-moss-600" />
                            <h2 className="text-xl font-serif font-bold text-stone-900">{t('studioAvailability')}</h2>
                        </div>

                        {studio.upcomingEvents.length > 0 ? (
                            <div className="space-y-3">
                                {studio.upcomingEvents
                                    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                    .map((event: any) => {
                                        const start = new Date(event.start_time);
                                        const end = new Date(event.end_time);
                                        return (
                                            <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 text-center py-1 px-2 bg-white rounded border border-stone-200 shadow-sm">
                                                        <span className="text-[10px] uppercase font-bold text-stone-400 block leading-none">{start.toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-lg font-bold text-stone-800 leading-none">{start.getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-stone-900">{event.title}</p>
                                                        <p className="text-xs text-stone-500">
                                                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-stone-400 border-stone-200 bg-white">{t('booked')}</Badge>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ) : (
                            <p className="text-stone-500 italic text-center py-4">{t('noBookings')}</p>
                        )}
                    </div>

                    {/* Events Section */}
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-serif font-bold text-stone-900">{t('upcomingEvents')}</h2>
                            {/* <Button variant="ghost" className="text-moss-700">View All</Button> */}
                        </div>

                        {studio.upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {studio.upcomingEvents.map((event: any) => (
                                    <Link href={`/events/${event.id}`} key={event.id} className="group block focus:outline-none">
                                        <Card className="h-full cursor-pointer overflow-hidden border-stone-200 bg-white hover:border-moss-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                            <div className="aspect-[3/2] w-full bg-stone-200 relative overflow-hidden">
                                                {event.image_url ? (
                                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 bg-stone-100">
                                                        Event
                                                    </div>
                                                )}
                                                <Badge className="absolute top-3 left-3 bg-white/90 text-stone-900 shadow-sm backdrop-blur">{event.category || 'Event'}</Badge>
                                            </div>
                                            <CardHeader className="p-4 flex-grow">
                                                <span className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                                                    {formatEventDate(event.start_time)}
                                                </span>
                                                <CardTitle className="text-base leading-tight group-hover:text-moss-700 transition-colors line-clamp-2">
                                                    {event.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardFooter className="p-4 pt-0 text-stone-500 text-sm">
                                                From €{event.price}
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-dashed border-stone-200 p-12 text-center text-stone-500">
                                <CalendarPlus className="h-10 w-10 mx-auto mb-4 text-stone-300" />
                                <p>No events scheduled at this studio yet.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
