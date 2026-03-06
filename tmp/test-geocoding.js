// Simple JS test for geocoding
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function geocodeAddress(address) {
    if (!MAPBOX_TOKEN) {
        console.warn('[Geocoding] No Mapbox token found');
        return null;
    }
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=1&proximity=13.405,52.52`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            return { latitude, longitude, place_name: data.features[0].place_name };
        }
        return null;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function runTest() {
    console.log('Testing with token:', MAPBOX_TOKEN ? 'FOUND' : 'MISSING');
    const result = await geocodeAddress('Bernauer Str. 63, 13355 Berlin');
    console.log('Result:', result);
}

runTest();
