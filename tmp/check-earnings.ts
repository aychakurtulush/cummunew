import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
        .from('events')
        .select(`
        id,
        title,
        price,
        start_time,
        status,
        bookings (
            id,
            status,
            checked_in
        )
    `)
        .limit(1);

    console.log('Result Data:', data);
    console.log('Error:', error);
}

check();
