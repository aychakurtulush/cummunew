'use client'
import { createStudio } from '../../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Upload, Building2, MapPin, Users, Coins, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CreateStudioPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Check if total exceeds 5
        if (selectedFiles.length + files.length > 5) {
            toast.error("You can only upload a maximum of 5 images.");
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        files.forEach((file) => {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`Image ${file.name} is too large. Please select images under 10MB.`);
            } else {
                validFiles.push(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === validFiles.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                        setSelectedFiles(prev => [...prev, ...validFiles]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        // Reset input so the same files can be selected again if removed
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (selectedFiles.length === 0) {
            setError("At least one image is required to publish your studio.");
            toast.error("Image is required.");
            scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        // Remove the default empty 'images' input from native form
        formData.delete('images');
        // Append all selected files
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            console.log("Submitting form data...");
            const result = await createStudio(null, formData);

            if (result.success) {
                toast.success("Studio created successfully! 🎉");
                router.push("/host/studios");
            } else {
                console.error("Server returned error:", result);
                setError(result.message || "Failed to create studio");
                toast.error(result.message || "Failed to create studio");
            }
        } catch (e: any) {
            console.error("CRITICAL SUBMISSION ERROR:", e);
            // This catches the 'Client-side exception' which is often a network/payload size issue
            setError("Connection failed. This usually happens if the image is too large or the server is unreachable.");
            toast.error("Submission failed. Try a smaller image.");
        } finally {
            setIsLoading(false);
        }
    }

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
                        <label htmlFor="images" className="text-sm font-semibold text-stone-700">Studio Photos (Max 5)</label>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="images"
                                    className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm ${selectedFiles.length >= 5 ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed' : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900'}`}
                                >
                                    <Upload className="h-4 w-4" />
                                    Choose Images
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
                                <span className="text-xs text-stone-500 italic">Up to 5 images. Max 10MB each.</span>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-video w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-sm group">
                                            <img src={preview} alt={`Preview ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <Badge className="absolute top-2 left-2 bg-moss-600/90 hover:bg-moss-700 text-white border-0 shadow-sm">Cover</Badge>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                            >
                                                ✕
                                            </button>
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

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-stone-700 block">Features</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Wifi', 'Accessibility', 'Parking', 'Air Conditioning', 'Tea/Coffee', 'Projector'].map((feature) => (
                                <div key={feature} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="features"
                                        value={feature}
                                        id={`feature-${feature}`}
                                        className="h-4 w-4 rounded border-stone-300 text-moss-600 focus:ring-moss-600/20"
                                    />
                                    <label htmlFor={`feature-${feature}`} className="text-sm text-stone-600 cursor-pointer">
                                        {feature}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto bg-moss-600 hover:bg-moss-700 text-white font-semibold text-base px-8 shadow-md">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Publish Studio"
                        )}
                    </Button>
                </div>

            </form>
        </div>
    )
}
