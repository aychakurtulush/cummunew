"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, ArrowRight, Coins } from "lucide-react";

interface Studio {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    price_per_hour: number | null;
    capacity: number | null;
    images: string[] | null;
    rating?: number; // Future proofing
}

export function StudioCard({ studio }: { studio: Studio }) {
    // Use first image or fallback
    const coverImage = studio.images?.[0] || null;

    return (
        <Link href={`/studios/${studio.id}`} className="group block focus:outline-none">
            <Card className="h-full cursor-pointer overflow-hidden border-stone-200 bg-white hover:border-moss-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Image Section */}
                <div className="aspect-[4/3] w-full bg-stone-200 relative overflow-hidden">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt={studio.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-sm font-medium">
                            [No Image]
                        </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                        {studio.capacity && (
                            <Badge variant="secondary" className="bg-white/90 text-stone-700 shadow-sm backdrop-blur-md border-stone-200">
                                <Users className="h-3 w-3 mr-1" />
                                {studio.capacity} ppl
                            </Badge>
                        )}
                    </div>

                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 backdrop-blur text-stone-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            View Studio
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <CardHeader className="p-4 pb-2 space-y-1">
                    <CardTitle className="text-lg leading-tight group-hover:text-moss-700 transition-colors line-clamp-1">
                        {studio.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-sm text-stone-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{studio.location || "Berlin"}</span>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 pb-4 flex-grow">
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                        {studio.description || "No description available."}
                    </p>
                </CardContent>

                {/* Footer Section */}
                <CardFooter className="p-4 pt-3 border-t border-stone-100 mt-auto flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-stone-900">€{studio.price_per_hour}</span>
                        <span className="text-xs text-stone-500 font-medium">/ hour</span>
                    </div>

                    <span className="text-sm font-medium text-moss-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                        Details <ArrowRight className="h-3 w-3" />
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
