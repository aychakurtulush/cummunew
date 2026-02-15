'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { updateProfile } from "./actions"; // Import the server action
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            disabled={pending}
            className="bg-moss-600 hover:bg-moss-700 text-white"
        >
            {pending ? "Saving..." : "Save Changes"}
        </Button>
    );
}

export function ProfileForm({ user, initialProfile }: { user: any, initialProfile: any }) {

    const result = await updateProfile(null, formData);
    if (result?.message && (result.message.includes('Error') || result.message.startsWith('Failed'))) {
        toast.error(result.message);
    } else {
        toast.success("Profile updated successfully!");
    }
}

return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
        <form action={action} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-moss-100 text-moss-700 text-2xl">
                        {(initialProfile.full_name || user.email || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <Button variant="outline" size="sm" type="button">Change Photo</Button>
                    <p className="text-xs text-stone-400 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="full_name" className="text-sm font-medium text-stone-700">Full Name</label>
                    <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={initialProfile.full_name || ''}
                        placeholder="Your full name"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="bio" className="text-sm font-medium text-stone-700">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        className="flex min-h-[100px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={initialProfile.bio || ''}
                        placeholder="Tell us a bit about yourself..."
                    />
                    <p className="text-xs text-stone-400">Brief description for your profile.</p>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
                    <Input id="email" defaultValue={user.email} disabled className="bg-stone-50 text-stone-500" />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <SubmitButton />
            </div>
        </form>
    </div>
);
}
