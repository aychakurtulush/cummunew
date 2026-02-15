import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
    const supabase = await createClient();

    if (!supabase) {
        return <div className="p-8">Backend not configured</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch profile
    let profile = { full_name: "", bio: "" };

    // Try fetching from profiles table
    const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (dbProfile) {
        profile = { ...profile, ...dbProfile };
    } else {
        // Fallback to auth metadata if profile doesn't exist yet
        profile.full_name = user.user_metadata?.full_name || "";
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Public Profile</h1>
                <p className="text-stone-500">Manage how you appear to other community members.</p>
            </div>

            <ProfileForm user={user} initialProfile={profile} />
        </div>
    );
}
