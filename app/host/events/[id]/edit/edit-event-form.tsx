'use client'
import { updateEvent } from '@/app/host/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useActionState } from 'react'
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

const initialState = {
    message: '',
}

interface EditEventFormProps {
    event: any;
    studios: any[];
}

export default function EditEventForm({ event, studios }: EditEventFormProps) {
    const [state, formAction, isPending] = useActionState(updateEvent, initialState);
    const [locationType, setLocationType] = useState<string>(event.studio_id ? "studio" : "home");
    const router = useRouter();

    // Re-format date strings for input
    // YYYY-MM-DDThh:mm
    const formatDateForInput = (isoString: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        // Adjust for timezone offset if needed, but for simplicity in MVP we use local time or strip Z
        // A robust solution uses date-fns or similar
        return d.toISOString().slice(0, 16);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
                <Link href="/host/events" className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-serif font-bold text-stone-900">Edit Event</h1>
                <p className="text-stone-600">Update event details.</p>
            </div>

            <Separator />

            {state?.message && state.message !== 'Success' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{state.message}</span>
                </div>
            )}

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="id" value={event.id} />

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-stone-900">Basic Information</h3>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-semibold text-stone-700">Event Title</label>
                        <Input id="title" name="title" defaultValue={event.title} required />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-semibold text-stone-700">Category</label>
                        <select
                            id="category"
                            name="category"
                            defaultValue={event.category}
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
                            defaultValue={event.description}
                            className="flex min-h-[120px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
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

                        {locationType === 'studio' && studios.length > 0 ? (
                            <div className="space-y-2">
                                <label htmlFor="studio_id" className="text-sm font-semibold text-stone-700">Select Studio</label>
                                <select
                                    id="studio_id"
                                    name="studio_id"
                                    defaultValue={event.studio_id || ""}
                                    className="flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600"
                                    required
                                >
                                    <option value="" disabled>Select a studio</option>
                                    {studios.map(studio => (
                                        <option key={studio.id} value={studio.id}>{studio.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label htmlFor="city" className="text-sm font-semibold text-stone-700">City / District</label>
                                <Input id="city" name="city" defaultValue={event.city} required />
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
                                defaultValue={formatDateForInput(event.start_time)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="end_time" className="text-sm font-semibold text-stone-700">End Time</label>
                            <Input
                                id="end_time"
                                name="end_time"
                                type="datetime-local"
                                defaultValue={formatDateForInput(event.end_time)}
                                required
                            />
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
                            <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={event.price} required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="capacity" className="text-sm font-semibold text-stone-700">Capacity (spots)</label>
                            <Input id="capacity" name="capacity" type="number" min="1" defaultValue={event.capacity} required />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Link href="/host/events">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" size="lg" className="w-full sm:w-auto bg-moss-600 hover:bg-moss-700 text-white font-semibold" disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>

            </form>
        </div>
    )
}
