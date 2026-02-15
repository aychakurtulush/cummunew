
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpgsurxhxftdacyjtiyc.supabase.co';
const supabaseKey = 'sb_publishable_IINgLnWo35FzUG5M-4OE8g_hZ-fKeAf';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking DB...");

    const { data: events, error: e1 } = await supabase.from('events').select('title');
    if (e1) console.log("Event Error:", e1.message);
    else console.log("Events found:", events ? events.length : 0);

    const { data: studios, error: e2 } = await supabase.from('studios').select('name');
    if (e2) console.log("Studio Error:", e2.message);
    else console.log("Studios found:", studios ? studios.length : 0);

    const { data: bookings, error: e3 } = await supabase.from('bookings').select('id');
    if (e3) console.log("Booking Error:", e3.message);
    else console.log("Bookings found:", bookings ? bookings.length : 0);

    // Check specific "Clay Space" existence
    const { data: clay, error: e4 } = await supabase.from('studios').select('name').eq('name', 'Clay Space Berlin');
    if (clay && clay.length > 0) {
        console.log("!!! CLAY SPACE FOUND IN DB !!!");
    } else {
        console.log("Clay Space NOT found in DB.");
    }
}

check();
