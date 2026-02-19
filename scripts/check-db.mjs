import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};

try {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, { encoding: 'utf-8' });
        const lines = content.split(/\r?\n/);
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const index = trimmed.indexOf('=');
            if (index > -1) {
                const key = trimmed.substring(0, index).trim();
                let val = trimmed.substring(index + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                env[key] = val;
            }
        });
    }
} catch (e) {
    console.error("Error reading .env.local:", e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Credentials not found in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking database schema...");

    // Try to select the new column
    const { data, error } = await supabase
        .from('events')
        .select('seating_type')
        .limit(1);

    if (error) {
        // If column doesn't exist, PostgREST often returns 4xx error about 'seating_type' not found
        console.log("Check failed with error:", error.message);
        if (error.message && (error.message.includes("seating_type") || error.code === "PGRST204" || error.code === "42703")) {
            console.log("MIGRATION_STATUS: PENDING");
        } else {
            console.log("MIGRATION_STATUS: UNKNOWN (Error: " + error.code + ")");
        }
    } else {
        console.log("MIGRATION_STATUS: APPLIED");
    }
}

checkSchema();
