'use client'
import { createEvent } from '../../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useActionState } from 'react'

const initialState = {
    message: '',
}

import { toBerlinInput } from "@/lib/date-utils";
import { useState } from "react";

interface Studio {
    id: string;
    name: string;
}

import { useSearchParams } from "next/navigation"

interface CreateEventFormProps {
    studios: Studio[];
    initialStartTime?: string;
    initialEndTime?: string;
}

export default function CreateEventForm({ studios, initialStartTime, initialEndTime }: CreateEventFormProps) {
    const [state, formAction] = useActionState(createEvent, initialState)
    const searchParams = useSearchParams();

    // Auto-fill from URL params (e.g. converting a studio booking)
    const studioIdParam = searchParams.get('studio_id');

    const [locationType, setLocationType] = useState<string>(studioIdParam ? "studio" : "home");
    // Initialize state with Berlin time, handling conversion from UTC if necessary
    const [startTime, setStartTime] = useState<string>(
        initialStartTime ? toBerlinInput(initialStartTime) : ""
    );
    const [endTime, setEndTime] = useState<string>(
        initialEndTime ? toBerlinInput(initialEndTime) : ""
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
                <Link href="/host" className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-serif font-bold text-stone-900">Create a New Event</h1>
                <p className="text-stone-600">Share your passion with the community.</p>
            </div>

            <Separator />

            {state?.message && state.message !== 'Success' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{state.message}</span>
                </div>
            )}

            <form action={formAction} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-stone-900">Basic Information</h3>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-semibold text-stone-700">Event Title</label>
                        <Input id="title" name="title" placeholder="e.g. Intro to Wheel Throwing" required />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-semibold text-stone-700">Category</label>
                        <select
                            id="category"
                            name="category"
                            className="flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600"
                            required
                        >
                            <option value="Arts & Crafts">Arts & Crafts</option>
                            <option value="Food & Drink">Food & Drink</option>
                            <option value="Sports & Wellness">Sports & Wellness</option>
                            <option value="Social & Games">Social & Games</option>
                            <option value="Language Exchange">Language Exchange</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-semibold text-stone-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="flex min-h-[120px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe what people will do..."
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="image" className="text-sm font-semibold text-stone-700">Event Cover Photo</label>
                        <div className="flex flex-col gap-4">
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const preview = document.getElementById('image-preview') as HTMLImageElement;
                                            if (preview) preview.src = reader.result as string;
                                            document.getElementById('preview-container')?.classList.remove('hidden');
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <div id="preview-container" className="hidden">
                                <p className="text-xs text-stone-500 mb-2">Preview:</p>
                                <div className="relative aspect-[16/9] w-full max-w-sm rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                                    <img id="image-preview" src="" alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                            </div>
                            <p className="text-xs text-stone-500 italic">Square or landscape images work best.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-stone-700">Event Options</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="seating_type" className="text-xs font-medium text-stone-600">Seating Arrangement</label>
                                <select
                                    id="seating_type"
                                    name="seating_type"
                                    className="flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20"
                                >
                                    <option value="mixed">Mixed/Flexible</option>
                                    <option value="seated">Seated</option>
                                    <option value="standing">Standing</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="materials_provided"
                                    name="materials_provided"
                                    value="true"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-stone-300 text-moss-600 focus:ring-moss-600/20"
                                />
                                <label
                                    htmlFor="materials_provided"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-stone-700"
                                >
                                    Materials Provided
                                </label>
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="is_guided"
                                    name="is_guided"
                                    value="true"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-stone-300 text-moss-600 focus:ring-moss-600/20"
                                />
                                <label
                                    htmlFor="is_guided"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-stone-700"
                                >
                                    Guided Session
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Location & Time */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-stone-900">Location & Time</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="location_type" className="text-sm font-semibold text-stone-700">Location Type</label>
                            <select
                                id="location_type"
                                name="location_type"
                                className="flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600"
                                required
                                value={locationType}
                                onChange={(e) => setLocationType(e.target.value)}
                            >
                                <option value="home">Home</option>
                                <option value="studio">Studio</option>
                                <option value="partner_venue">Partner Venue</option>
                            </select>
                        </div>

                        {locationType === 'studio' ? (
                            studios.length > 0 ? (
                                <div className="space-y-2">
                                    <label htmlFor="studio_id" className="text-sm font-semibold text-stone-700">Select Studio</label>
                                    <select
                                        id="studio_id"
                                        name="studio_id"
                                        className="flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600"
                                        required
                                        defaultValue={studioIdParam || ""}
                                    >
                                        <option value="" disabled selected>Select a studio</option>
                                        {studios.map(studio => (
                                            <option key={studio.id} value={studio.id}>{studio.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-stone-400">Select Studio</label>
                                    <div className="flex h-10 items-center px-3 border border-dashed border-stone-300 rounded-lg bg-stone-50 text-sm text-stone-500">
                                        No studios found. <Link href="/host/studios/create" className="ml-1 text-moss-700 font-medium hover:underline">Create a Studio</Link>
                                    </div>
                                    <input type="hidden" name="studio_id" required /> {/* Force error if they submit */}
                                </div>
                            )
                        ) : (
                            <div className="space-y-2">
                                <label htmlFor="city" className="text-sm font-semibold text-stone-700">City / District</label>
                                <Input id="city" name="city" placeholder="e.g. Kreuzberg" required />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="start_time" className="text-sm font-semibold text-stone-700">Start Time</label>
                            <Input
                                id="start_time"
                                name="start_time"
                                type="datetime-local"
                                required
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                    const endTimeInput = document.getElementById('end_time') as HTMLInputElement;
                                    if (endTimeInput) {
                                        endTimeInput.min = e.target.value;
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="end_time" className="text-sm font-semibold text-stone-700">End Time</label>
                            <Input
                                id="end_time"
                                name="end_time"
                                type="datetime-local"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                            <p className="text-[10px] text-stone-400">Must be after the start time.</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Tickets */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-stone-900">Tickets</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-semibold text-stone-700">Price per person (€)</label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="45.00" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="capacity" className="text-sm font-semibold text-stone-700">Capacity (spots)</label>
                            <Input id="capacity" name="capacity" type="number" min="1" placeholder="10" required />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" className="w-full sm:w-auto bg-moss-600 hover:bg-moss-700 text-white font-semibold">
                        Publish Event
                    </Button>
                </div>

            </form>
        </div>
    )
}
