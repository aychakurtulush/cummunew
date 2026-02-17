import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { SearchInput } from "./search-input"
import { Suspense } from "react"
import { NavLinks } from "./nav-links"
import { NavbarActions } from "./navbar-actions"
import { MobileNav } from "./mobile-nav"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Logo */}
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-stone-900">
                        Communew.
                    </Link>
                    <NavLinks />
                    <MobileNav />
                </div>

                {/* Center: Search - Enforce min-width */}
                <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-2 md:mx-4 min-w-[280px]">
                    <Suspense fallback={<div className="w-full h-9 bg-stone-100 rounded-full animate-pulse" />}>
                        <SearchInput />
                    </Suspense>
                </div>

                {/* Right: Actions */}
                <NavbarActions user={user} />
            </div>
        </header>
    )
}
