import { geocodeAddress } from '../lib/geocoding.js';

async function test() {
    console.log('Testing Geocoding...');
    const addresses = [
        'Bernauer Str. 63, 13355 Berlin',
        'Mauerpark, Berlin',
        'Alexanderplatz, Berlin'
    ];

    for (const addr of addresses) {
        const result = await geocodeAddress(addr);
        if (result) {
            console.log(`✅ Success for "${addr}":`, result);
        } else {
            console.log(`❌ Failed for "${addr}"`);
        }
    }
}

test();
