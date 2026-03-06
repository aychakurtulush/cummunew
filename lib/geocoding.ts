/**
 * Geocoding Utility for Communew
 * Uses Mapbox API to convert addresses to coordinates.
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface GeocodingResult {
    latitude: number;
    longitude: number;
    place_name?: string;
}

/**
 * Geocode a string address into coordinates.
 * Defaults to searching around Berlin for better accuracy if district/city is missing.
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!MAPBOX_TOKEN) {
        console.warn('[Geocoding] No Mapbox token found in environment variables.');
        return null;
    }

    if (!address || address.trim().length < 3) {
        return null;
    }

    try {
        // Encode address and add proximity/limit parameters for Berlin/Germany
        // Berlin Bounding Box roughly: 13.0, 52.3 (SW) to 13.7, 52.7 (NE)
        const encodedAddress = encodeURIComponent(address);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=1&proximity=13.405,52.52`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            return {
                latitude,
                longitude,
                place_name: data.features[0].place_name
            };
        }

        console.warn(`[Geocoding] No results found for address: ${address}`);
        return null;
    } catch (error) {
        console.error(`[Geocoding] Error geocoding address "${address}":`, error);
        return null;
    }
}
