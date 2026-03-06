"use client";

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';

// Fix for default Leaflet markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

// Berlin center coordinates
const INITIAL_CENTER: [number, number] = [52.5200, 13.4050];
const ZOOM_LEVEL = 11;

export function EventsMap({ events, mapboxToken }: { events: any[], mapboxToken: string }) {
    // Filter events that actually have coordinates (for MVP, we'll fake some coordinates around Berlin if they don't have them)
    const mapEvents = useMemo(() => {
        return events
            .filter(event => event.latitude && event.longitude)
            .map((event) => {
                return {
                    ...event,
                    latitude: Number(event.latitude),
                    longitude: Number(event.longitude),
                };
            });
    }, [events]);

    if (!mapboxToken) return null;

    // Use Mapbox style tiles inside Leaflet
    const mapboxTileUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative z-0">
            <MapContainer
                center={INITIAL_CENTER}
                zoom={ZOOM_LEVEL}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url={mapboxTileUrl}
                />

                {mapEvents.map((event) => (
                    <Marker
                        key={`marker-${event.id}`}
                        position={[event.latitude, event.longitude] as [number, number]}
                    >
                        <Popup className="rounded-xl overflow-hidden shadow-xl" maxWidth={300}>
                            <div className="p-0 min-w-[200px] max-w-[250px] m-[-13px]">
                                {event.image_url && (
                                    <div className="aspect-[16/9] w-full bg-stone-100 mb-2">
                                        <img src={event.image_url} className="w-full h-full object-cover rounded-t-xl" alt={event.title} />
                                    </div>
                                )}

                                <div className="p-3">
                                    <Badge variant="secondary" className="mb-2 bg-moss-50 text-moss-700">{event.category}</Badge>

                                    <h3 className="font-bold text-stone-900 leading-tight mb-2 text-base">{event.title}</h3>

                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mb-3">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(event.start_time)}
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                                        <span className="font-bold text-stone-900">€{event.price}</span>
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="text-xs font-bold text-moss-600 flex items-center gap-1 hover:text-moss-700"
                                        >
                                            Details <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
