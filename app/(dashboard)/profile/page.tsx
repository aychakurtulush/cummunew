import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Assuming we have this, if not I'll use standard label
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const supabase = await createClient();
    let user = null;
    let profile = { full_name: "Demo User", email: "demo@example.com", bio: "Art enthusiast living in Berlin." };

    if (supabase) {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
        if (!user) redirect('/login');

        // Fetch profile
        const { data: dbProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        if (dbProfile) {
            profile = { ...profile, ...dbProfile, email: user.email };
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Public Profile</h1>
                <p className="text-stone-500">Manage how you appear to other community members.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-moss-100 text-moss-700 text-2xl">
                            {profile.full_name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Button variant="outline" size="sm">Change Photo</Button>
                        <p className="text-xs text-stone-400 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                    </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="full_name" className="text-sm font-medium text-stone-700">Full Name</label>
                        <Input id="full_name" defaultValue={profile.full_name} />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="bio" className="text-sm font-medium text-stone-700">Bio</label>
                        <textarea
                            id="bio"
                            className="flex min-h-[100px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={profile.bio}
                            placeholder="Tell us a bit about yourself..."
                        />
                        <p className="text-xs text-stone-400">Brief description for your profile.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
                        <Input id="email" defaultValue={profile.email} disabled className="bg-stone-50 text-stone-500" />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button className="bg-moss-600 hover:bg-moss-700 text-white">Save Changes</Button>
                </div>
            </div>
        </div>
    );
}
