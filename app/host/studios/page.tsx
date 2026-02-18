import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Building2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteStudioButton } from "./components/delete-studio-button";

export default async function HostStudiosPage() {
    const supabase = await createClient();

    if (!supabase) {
        return redirect("/login");
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Fetch studios
    const { data: studios } = await supabase
        .from('studios')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900">My Studios</h1>
                    <p className="text-stone-500 text-sm">Manage your venues and spaces</p>
                </div>
                <Link href="/host/studios/create">
                    <Button className="bg-moss-600 hover:bg-moss-700 text-white gap-2">
                        <PlusCircle className="h-4 w-4" />
                        List New Studio
                    </Button>
                </Link>
            </div>

            {studios && studios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studios.map((studio) => (
                        <div key={studio.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            {/* Image Placeholder */}
                            <div className="aspect-[3/2] bg-stone-100 relative overflow-hidden">
                                {studio.images && studio.images[0] ? (
                                    <img
                                        src={studio.images[0]}
                                        alt={studio.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                                        <ImageIcon className="h-8 w-8 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <Badge variant="secondary" className="bg-white/90 text-stone-700 backdrop-blur-sm">
                                        {studio.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <h3 className="font-semibold text-lg text-stone-900 line-clamp-1">{studio.name}</h3>

                                <div className="flex items-center gap-2 text-stone-500 text-sm">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="truncate">{studio.location || "No location set"}</span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                    <div className="text-sm">
                                        <span className="font-medium text-stone-900">
                                            {studio.price_per_hour ? `€${studio.price_per_hour}` : "Price TBD"}
                                        </span>
                                        <span className="text-stone-500"> / hour</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/host/studios/${studio.id}/edit`}>
                                            <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-900">
                                                Edit
                                            </Button>
                                        </Link>
                                        <DeleteStudioButton studioId={studio.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-50 mb-4">
                        <Building2 className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-900">No studios listed yet</h3>
                    <p className="text-stone-500 max-w-sm mx-auto mt-2 mb-6">
                        Start earning by listing your creative space for workshops and events.
                    </p>
                    <Link href="/host/studios/create">
                        <Button className="bg-moss-600 hover:bg-moss-700 text-white">
                            List Your First Studio
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
