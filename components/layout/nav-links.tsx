'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

export function NavLinks() {
    const pathname = usePathname();
    const t = useTranslations('nav');

    const links = [
        { href: "/", label: t('explore') },
        { href: "/studios", label: t('studios') },
        { href: "/community", label: t('community') },
        { href: "/about", label: t('about') },
    ];

    return (
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            {links.map((link) => {
                const isActive = link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "transition-colors hover:text-stone-900",
                            isActive ? "font-bold text-stone-900" : "font-medium text-stone-600"
                        )}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
