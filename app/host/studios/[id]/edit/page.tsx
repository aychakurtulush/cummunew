'use client'
import { updateStudio } from '../../../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Upload, Building2, MapPin, Users, Coins, Sparkles, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function EditStudioPage({ params }: { params: { id: string } }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [studio, setStudio] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchStudio = async () => {
            try {
                const { data, error } = await supabase
                    .from('studios')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) {
                    toast.error("Failed to load studio details");
                    router.push('/host/studios');
                    return;
                }

                setStudio(data);
                if (data.images && data.images.length > 0) {
                    setImagePreview(data.images[0]);
                }
            } catch (err) {
                console.error("Error fetching studio:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchStudio();
    }, [params.id, router, supabase]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4.5 * 1024 * 1024) {
                toast.error("Image too large. Please select an image under 4.5MB.");
                e.target.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        formData.append('id', params.id); // Add ID to formData

        try {
            const result = await updateStudio(null, formData);

            if (result.success) {
                toast.success("Studio updated successfully!");
                router.push("/host/studios");
                router.refresh();
            } else {
                setError(result.message || "Failed to update studio");
                toast.error(result.message || "Failed to update studio");
            }
        } catch (e: any) {
            console.error("CRITICAL SUBMISSION ERROR:", e);
            setError("Connection failed.");
            toast.error("Update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
        );
    }

    if (!studio) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">

            <div className="space-y-4">
                <Link href="/host/studios" className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Studios
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Edit Studio</h1>
                    <p className="text-stone-600 mt-1">Update details for {studio.name}</p>
                </div>
            </div>

            <Separator />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-start gap-2" role="alert">
                    <span className="font-bold">Error:</span>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Basic Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-moss-700">
                        <Building2 className="h-5 w-5" />
                        <h3 className="text-lg font-medium text-stone-900">The Space</h3>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="name" className="text-sm font-semibold text-stone-700">Studio Name</label>
                        <Input id="name" name="name" defaultValue={studio.name} required className="bg-white" />
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="description" className="text-sm font-semibold text-stone-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={studio.description}
                            className="flex min-h-[120px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="image" className="text-sm font-semibold text-stone-700">Cover Photo (Optional update)</label>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="image"
                                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors bg-white shadow-sm"
                                >
                                    <Upload className="h-4 w-4" />
                                    Change Image
                                </label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <span className="text-xs text-stone-500 italic">Max 4.5MB. Leave empty to keep current image.</span>
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
                        <Input id="location" name="location" defaultValue={studio.location} required className="bg-white" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <label htmlFor="price_per_hour" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <Coins className="h-4 w-4 text-stone-400" />
                                Price per Hour (€)
                            </label>
                            <Input id="price_per_hour" name="price_per_hour" type="number" min="0" step="1" defaultValue={studio.price_per_hour} required className="bg-white" />
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="capacity" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                <Users className="h-4 w-4 text-stone-400" />
                                Capacity (people)
                            </label>
                            <Input id="capacity" name="capacity" type="number" min="1" defaultValue={studio.capacity} required className="bg-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="amenities" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-stone-400" />
                            Amenities
                        </label>
                        <Input
                            id="amenities"
                            name="amenities"
                            defaultValue={studio.amenities?.join(', ')}
                            className="bg-white"
                        />
                        <p className="text-[11px] text-stone-500">Separate with commas</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto bg-moss-600 hover:bg-moss-700 text-white font-semibold text-base px-8 shadow-md">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </div>
    )
}
