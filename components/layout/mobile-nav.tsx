"use client";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslations } from 'next-intl';

export function MobileNav({ user }: { user: any }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const t = useTranslations('nav');

    const links = [
        { href: "/", label: t('explore') },
        { href: "/studios", label: t('studios') },
        { href: "/community", label: t('community') },
        { href: "/about", label: t('about') },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6 text-stone-700" />
                    <span className="sr-only">{t('toggleMenu')}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="font-serif text-2xl font-bold text-left ml-4 pt-4">Communew.</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8 px-4">
                    {links.map((link) => {
                        const isActive = link.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "text-lg font-medium transition-colors py-2 border-b border-stone-100",
                                    isActive ? "text-moss-700" : "text-stone-600 hover:text-stone-900"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <div className="mt-4 space-y-3">
                        <Link href="/host" onClick={() => setOpen(false)}>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                {t('hostDashboard')}
                            </Button>
                        </Link>
                        {!user && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <Link href="/login" onClick={() => setOpen(false)}>
                                    <Button variant="ghost" className="w-full">
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/signup" onClick={() => setOpen(false)}>
                                    <Button className="w-full bg-moss-600 text-white">
                                        {t('signup')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
