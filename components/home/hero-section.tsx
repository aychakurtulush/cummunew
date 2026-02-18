"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative bg-stone-50/50 pt-20 pb-24 border-b border-stone-200 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <Badge variant="outline" className="bg-white/50 backdrop-blur text-stone-600 border-stone-200 px-3 py-1 text-xs uppercase tracking-wider font-semibold mx-auto">
                        Berlin Community Platform
                    </Badge>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-stone-900 tracking-tight leading-[1.05]">
                        Find your people.
                    </h1>

                    <p className="text-stone-600 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
                        Discover local workshops, gatherings, and creative spaces.
                        Join neighbors who share your passions.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            size="lg"
                            className="bg-moss-700 hover:bg-moss-800 text-white rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                            onClick={() => document.getElementById('events-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Events
                        </Button>
                        <Link href="/host/events/create" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full px-8 h-14 text-lg border-stone-300 hover:bg-white hover:text-moss-700 w-full sm:w-auto"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Host an Experience
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
