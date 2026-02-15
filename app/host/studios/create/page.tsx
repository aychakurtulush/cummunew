'use client'
import { createStudio } from '../../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Upload, Building2, MapPin, Users, Coins, Sparkles } from "lucide-react"
import Link from "next/link"
import { useActionState, useState } from 'react'
import { Badge } from "@/components/ui/badge"

const initialState = {
    message: '',
}

export default function CreateStudioPage() {
    const [state, formAction] = useActionState(createStudio, initialState)
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">

            <div className="space-y-4">
                <Link href="/host/studios" className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Studios
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">List Your Studio</h1>
                    <p className="text-stone-600 mt-1">Share your creative space seamlessly.</p>
                </div>
            </div>

            <Separator />

            {state?.message && state.message !== 'Success' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-start gap-2" role="alert">
                    <span className="font-bold">Error:</span>
                    <span>{state.message}</span>
                </div>
            )}

            <form action={formAction} className="space-y-8">

                {/* Basic Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-moss-700">
                        <Building2 className="h-5 w-5" />
                        <h3 className="text-lg font-medium text-stone-900">The Space</h3>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="name" className="text-sm font-semibold text-stone-700">Studio Name</label>
                        <Input id="name" name="name" placeholder="e.g. Sunny Loft in Kreuzberg" required className="bg-white" />
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="description" className="text-sm font-semibold text-stone-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="flex min-h-[120px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 focus:bg-white transition-colors"
                            placeholder="Tell guests about your space, lighting, and vibe..."
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="image" className="text-sm font-semibold text-stone-700">Cover Photo</label>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="image"
                                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors bg-white shadow-sm"
                                >
                                    <Upload className="h-4 w-4" />
                                    Choose Image
                                </label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    required
                                    onChange={handleImageChange}
                                />
                                <span className="text-xs text-stone-500 italic">Required</span>
                            </div>

                            {imagePreview && (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-moss-700">
                        <MapPin className="h-5 w-5" />
                        <h3 className="text-lg font-medium text-stone-900">Location & Details</h3>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="location" className="text-sm font-semibold text-stone-700">Address / Area</label>
                        <Input id="location" name="location" placeholder="e.g. Admiralbrücke Area, Kreuzberg" required className="bg-white" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <label htmlFor="price_per_hour" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <Coins className="h-4 w-4 text-stone-400" />
                                Price per Hour (€)
                            </label>
                            <Input id="price_per_hour" name="price_per_hour" type="number" min="0" step="1" placeholder="30" required className="bg-white" />
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="capacity" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <Users className="h-4 w-4 text-stone-400" />
                                Capacity (people)
                            </label>
                            <Input id="capacity" name="capacity" type="number" min="1" placeholder="15" required className="bg-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="amenities" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-stone-400" />
                            Amenities
                        </label>
                        <Input id="amenities" name="amenities" placeholder="Wifi, Projector, Sound System, Yoga Mats..." className="bg-white" />
                        <p className="text-[11px] text-stone-500">Separate with commas</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button type="submit" size="lg" className="w-full sm:w-auto bg-moss-600 hover:bg-moss-700 text-white font-semibold text-base px-8 shadow-md">
                        Publish Studio
                    </Button>
                </div>

            </form>
        </div>
    )
}
