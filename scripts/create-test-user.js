
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'testpilot@example.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Test Pilot' }
    });

    if (error) {
        if (error.message.includes('already been registered')) {
            console.log('User already exists');
        } else {
            console.error('Error creating user:', error);
        }
    } else {
        console.log('User created:', data.user.id);
    }
}

createTestUser();
