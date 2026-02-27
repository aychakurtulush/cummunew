"use client";

import { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

// Berlin center coordinates
const INITIAL_VIEW_STATE = {
    longitude: 13.4050,
    latitude: 52.5200,
    zoom: 11
};

export function EventsMap({ events, mapboxToken }: { events: any[], mapboxToken: string }) {
    const [popupInfo, setPopupInfo] = useState<any | null>(null);

    // Filter events that actually have coordinates (for MVP, we'll fake some coordinates around Berlin if they don't have them)
    // In a real production app, you would use PostGIS or store lat/lng on the events table
    const mapEvents = useMemo(() => {
        return events.map((event, index) => {
            // Demo data generation for map visualization
            // If the event doesn't have coordinates, scatter them around Berlin
            const hasCoords = event.latitude && event.longitude;

            // Random jitter around Berlin (approx 5-10km) if no real coords
            const randLat = 52.48 + (Math.random() * 0.08);
            const randLng = 13.35 + (Math.random() * 0.15);

            return {
                ...event,
                latitude: hasCoords ? event.latitude : randLat,
                longitude: hasCoords ? event.longitude : randLng,
            };
        });
    }, [events]);

    if (!mapboxToken) return null;

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative">
            <Map
                mapboxAccessToken={mapboxToken}
                initialViewState={INITIAL_VIEW_STATE}
                mapStyle="mapbox://styles/mapbox/light-v11"
            >
                <NavigationControl position="top-right" />

                {mapEvents.map((event) => (
                    <Marker
                        key={`marker-${event.id}`}
                        longitude={Number(event.longitude)}
                        latitude={Number(event.latitude)}
                        anchor="bottom"
                        onClick={(e: any) => {
                            e.originalEvent.stopPropagation();
                            setPopupInfo(event);
                        }}
                    >
                        <div className="bg-moss-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-moss-700 hover:scale-110 transition-transform">
                            <MapPin className="h-4 w-4" />
                        </div>
                    </Marker>
                ))}

                {popupInfo && (
                    <Popup
                        anchor="top"
                        longitude={Number(popupInfo.longitude)}
                        latitude={Number(popupInfo.latitude)}
                        onClose={() => setPopupInfo(null)}
                        closeOnClick={false}
                        className="rounded-xl overflow-hidden shadow-xl"
                        maxWidth="300px"
                    >
                        <div className="p-1 min-w-[200px]">
                            {popupInfo.image_url ? (
                                <div className="aspect-[16/9] w-full bg-stone-100 rounded-lg overflow-hidden mb-3">
                                    <img src={popupInfo.image_url} className="w-full h-full object-cover" alt={popupInfo.title} />
                                </div>
                            ) : null}

                            <Badge variant="secondary" className="mb-2 bg-moss-50 text-moss-700">{popupInfo.category}</Badge>

                            <h3 className="font-bold text-stone-900 leading-tight mb-1">{popupInfo.title}</h3>

                            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mb-2">
                                <Calendar className="h-3 w-3" />
                                {formatDate(popupInfo.start_time)}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                                <span className="font-bold text-stone-900">€{popupInfo.price}</span>
                                <Link
                                    href={`/events/${popupInfo.id}`}
                                    className="text-xs font-bold text-moss-600 flex items-center gap-1 hover:text-moss-700"
                                >
                                    Details <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
