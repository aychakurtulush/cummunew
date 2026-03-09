"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroSearch } from "./hero-search";
import { useTranslations } from 'next-intl';

export function HeroSection() {
    const t = useTranslations('home.hero');

    return (
        <section className="relative bg-stone-50/50 pt-20 pb-24 border-b border-stone-200 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mr-auto text-left space-y-8">
                    <Badge variant="outline" className="bg-white/50 backdrop-blur text-stone-600 border-stone-200 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                        {t('badge')}
                    </Badge>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-stone-900 tracking-tight leading-[1.05]">
                        {t('title')}
                    </h1>

                    <p className="text-stone-600 text-lg sm:text-xl md:text-2xl max-w-2xl leading-relaxed">
                        {t('subtitle')}
                    </p>

                    <div className="w-full pt-4">
                        <HeroSearch />
                    </div>
                </div>
            </div>
        </section>
    );
}
