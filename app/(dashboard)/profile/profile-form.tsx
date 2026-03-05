'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Globe } from "lucide-react";
import { updateProfile } from "./actions"; // Import the server action
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useState } from "react";

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

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    async function action(formData: FormData) {
        const result = await updateProfile(null, formData);

        if (result?.message && (result.message.trim().toLowerCase().includes('error') || result.message.trim().toLowerCase().startsWith('failed'))) {
            toast.error(result.message);
        } else {
            toast.success("Profile updated successfully!");
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            toast.info(`Selected: ${file.name}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
            <form action={action} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                        <AvatarImage src={previewUrl || initialProfile.avatar_url} alt="Profile" className="object-cover" />
                        <AvatarFallback className="bg-moss-100 text-moss-700 text-2xl">
                            {(initialProfile.full_name || user.email || '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            Change Photo
                        </Button>
                        <input
                            type="file"
                            id="avatar-upload"
                            name="avatar"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-stone-400">JPG, GIF or PNG. Max 1MB.</p>
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

                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-semibold text-stone-900 border-b border-stone-100 pb-2">Social Links</h4>

                        <div className="space-y-1.5">
                            <label htmlFor="instagram_url" className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-stone-500" />
                                Instagram
                            </label>
                            <Input
                                id="instagram_url"
                                name="instagram_url"
                                defaultValue={initialProfile.social_links?.instagram || ''}
                                placeholder="https://instagram.com/username"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="website_url" className="text-sm font-medium text-stone-700 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-stone-500" />
                                Website
                            </label>
                            <Input
                                id="website_url"
                                name="website_url"
                                defaultValue={initialProfile.social_links?.website || ''}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
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
