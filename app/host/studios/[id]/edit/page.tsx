'use client'
import { updateStudio } from '../../../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Upload, Building2, MapPin, Users, Coins, Sparkles, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use } from 'react'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

export default function EditStudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [studio, setStudio] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchStudio = async () => {
            try {
                const { data, error } = await supabase
                    .from('studios')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error("Supabase Fetch Error:", error);
                    toast.error(`Failed to load studio details: ${error.message}`);
                    // router.push('/host/studios'); // Don't redirect immediately to allow debugging
                    setError(error.message);
                    return;
                }

                setStudio(data);
                if (data.images && data.images.length > 0) {
                    setImagePreviews(data.images);
                }
            } catch (err: any) {
                console.error("Error fetching studio:", err);
                setError(err.message || "Unknown error");
            } finally {
                setIsFetching(false);
            }
        };

        fetchStudio();
    }, [id, router, supabase]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Note for edit form: selectedFiles + imagePreviews isn't inherently accurate if replacing
        // For simplicity in this iteration, we treat new selection as replacing existing selection
        // so we check if the purely new selection exceeds 5.
        if (files.length > 5) {
            toast.error("You can only upload a maximum of 5 images.");
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        files.forEach((file) => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`Image ${file.name} is too large. Please select images under 10MB.`);
            } else {
                validFiles.push(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === validFiles.length) {
                        setImagePreviews(newPreviews); // Replaces existing previews with new selection
                        setSelectedFiles(validFiles);
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        e.target.value = "";
    };

    const removeImage = (index: number) => {
        // In this simple MVP rewrite logic, removing clears the selected new files array.
        // True "selective" removal of existing array vs new array needs more complex state.
        // For now:
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        formData.append('id', id); // Add ID to formData

        formData.delete('images');
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

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
                        <label htmlFor="images" className="text-sm font-semibold text-stone-700">Studio Photos (Max 5)</label>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="images"
                                    className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm ${selectedFiles.length >= 5 ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed' : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900'}`}
                                >
                                    <Upload className="h-4 w-4" />
                                    Change Images
                                </label>
                                <Input
                                    id="images"
                                    name="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={selectedFiles.length >= 5}
                                />
                                <span className="text-xs text-stone-500 italic">Up to 5 images. Max 10MB each. Leave empty to keep existing. <br />Note: Uploading new images will replace current ones.</span>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-video w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-sm group">
                                            <img src={preview} alt={`Preview ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <Badge className="absolute top-2 left-2 bg-moss-600/90 hover:bg-moss-700 text-white border-0 shadow-sm">Cover</Badge>
                                            )}
                                        </div>
                                    ))}
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

                    <div className="space-y-3">
                        <label htmlFor="space_rules" className="text-sm font-semibold text-stone-700">Space Rules</label>
                        <textarea
                            id="space_rules"
                            name="space_rules"
                            defaultValue={studio.space_rules}
                            className="flex min-h-[100px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-600/20 focus-visible:border-moss-600 focus:bg-white transition-colors"
                            placeholder="e.g. No smoking indoors, keep noise down after 10 PM, etc."
                        />
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
