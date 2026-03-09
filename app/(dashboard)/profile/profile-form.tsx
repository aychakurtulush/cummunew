'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Globe, ShieldCheck, Check } from "lucide-react";
import { updateProfile } from "./actions"; // Import the server action
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
    const [bioText, setBioText] = useState(initialProfile.bio || '');

    async function action(formData: FormData) {
        const result = await updateProfile(null, formData);

        if (result?.success) {
            toast.success("Profile updated successfully!");
        } else if (result?.message) {
            toast.error(result.message);
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

    const isBioLongEnough = bioText.length >= 50;
    const hasAvatar = previewUrl || initialProfile.avatar_url || user.user_metadata?.avatar_url;
    const hasName = initialProfile.full_name || user.user_metadata?.full_name;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-8">
                <form action={action} className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-8">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-1 ring-stone-100">
                            <AvatarImage src={previewUrl || initialProfile.avatar_url} alt="Profile" className="object-cover" />
                            <AvatarFallback className="bg-moss-50 text-moss-700 text-3xl font-serif">
                                {(initialProfile.full_name || user.email || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-3">
                            <h3 className="font-serif font-bold text-stone-900 text-lg leading-none">Profile Image</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" type="button" className="rounded-full px-5" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                    Change photo
                                </Button>
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                name="avatar"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-stone-400">Recommended: Square image, max 1MB.</p>
                        </div>
                    </div>

                    <Separator className="bg-stone-100" />

                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="full_name" className="text-sm font-semibold text-stone-700">Display Name</label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={initialProfile.full_name || ''}
                                placeholder="How you want to be known"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="city" className="text-sm font-semibold text-stone-700">Home City</label>
                            <Input
                                id="city"
                                name="city"
                                defaultValue={initialProfile.city || ''}
                                placeholder="e.g. Amsterdam, NL"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="bio" className="text-sm font-semibold text-stone-700">Short Biography</label>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                    isBioLongEnough ? "text-moss-600 bg-moss-50" : "text-amber-600 bg-amber-50"
                                )}>
                                    {bioText.length} / 50 characters min
                                </span>
                            </div>
                            <textarea
                                id="bio"
                                name="bio"
                                className="flex min-h-[140px] w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 transition-all"
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                placeholder="Describe your creative journey, your philosophy, or what you love about hosting..."
                            />
                            <p className="text-xs text-stone-400 italic">This will be shown on your public profile and event pages.</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                <Separator className="flex-1" />
                                Social Presence
                                <Separator className="flex-1" />
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="instagram_url" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-stone-400" />
                                        Instagram
                                    </label>
                                    <Input
                                        id="instagram_url"
                                        name="instagram_url"
                                        defaultValue={initialProfile.social_links?.instagram || ''}
                                        placeholder="@yourhandle"
                                        className="h-11 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="website_url" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-stone-400" />
                                        Portfolio / Website
                                    </label>
                                    <Input
                                        id="website_url"
                                        name="website_url"
                                        defaultValue={initialProfile.social_links?.website || ''}
                                        placeholder="https://yourwork.com"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 opacity-60">
                            <label htmlFor="email" className="text-sm font-semibold text-stone-700">Account Email</label>
                            <Input id="email" defaultValue={user.email} disabled className="h-11 rounded-xl bg-stone-50" />
                            <p className="text-[10px] text-stone-400">Email addresses can be updated in Account Settings.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-stone-100 flex justify-end">
                        <SubmitButton />
                    </div>
                </form>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
                <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl ring-1 ring-white/10">
                    <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-moss-400" />
                        Verification
                    </h3>
                    <p className="text-stone-400 text-xs leading-relaxed mb-6">
                        Complete these steps to unlock hosting privileges and build trust within the community.
                    </p>

                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <div className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center border",
                                hasName ? "bg-moss-500 border-moss-500" : "border-stone-700"
                            )}>
                                {hasName && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("text-xs font-medium", hasName ? "text-white" : "text-stone-500")}>Full Name Provided</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center border",
                                isBioLongEnough ? "bg-moss-500 border-moss-500" : "border-stone-700"
                            )}>
                                {isBioLongEnough && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("text-xs font-medium", isBioLongEnough ? "text-white" : "text-stone-500")}>Comprehensive Bio (50+ chars)</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center border",
                                hasAvatar ? "bg-moss-500 border-moss-500" : "border-stone-700"
                            )}>
                                {hasAvatar && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("text-xs font-medium", hasAvatar ? "text-white" : "text-stone-500")}>Profile Photograph</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center border",
                                user.email_confirmed_at ? "bg-moss-500 border-moss-500" : "border-stone-700"
                            )}>
                                {user.email_confirmed_at && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("text-xs font-medium", user.email_confirmed_at ? "text-white" : "text-stone-500")}>Email Verified</span>
                        </li>
                    </ul>
                </div>

                <div className="p-6 border border-stone-200 rounded-2xl bg-white text-sm text-stone-600">
                    <h4 className="font-serif font-bold text-stone-900 mb-2">Public Visibility</h4>
                    <p className="leading-relaxed text-xs">
                        Your display name, bio, and social links are public. Your email address remains private and is only used for platform communications.
                    </p>
                </div>
            </div>
        </div>
    );
}
