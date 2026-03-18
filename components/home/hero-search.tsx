"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function HeroSearch() {
    const t = useTranslations('home.hero');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);

        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }

        router.push(`/?${params.toString()}#events-explorer`);

        // Short timeout to simulate immediate feedback then reset loader
        setTimeout(() => setIsSearching(false), 800);
    };

    return (
        <form
            onSubmit={handleSearch}
            className="relative max-w-2xl w-full group"
        >
            <div className="relative flex items-center">
                <div className="absolute left-5 text-stone-400 group-focus-within:text-moss-600 transition-colors">
                    {isSearching ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5" />
                    )}
                </div>
                <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-16 pl-14 pr-32 bg-white text-stone-900 border-stone-200 rounded-2xl text-lg shadow-xl shadow-stone-200/50 focus:ring-moss-500 focus:border-moss-500 transition-all placeholder:text-stone-400"
                />
                <div className="absolute right-2">
                    <Button
                        type="submit"
                        className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-6 h-12 font-medium transition-all"
                    >
                        {t('search')}
                    </Button>
                </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider py-1.5">{t('popular')}</span>
                {["Workshops", "Community", "Berlin", "Wellness"].map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => {
                            setQuery(tag);
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("q", tag);
                            router.push(`/?${params.toString()}#events-explorer`);
                        }}
                        className="text-xs font-medium text-stone-500 bg-stone-100 hover:bg-moss-50 hover:text-moss-700 px-3 py-1.5 rounded-full border border-transparent hover:border-moss-200 transition-all"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </form>
    );
}
