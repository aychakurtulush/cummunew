import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { signout } from "@/app/(auth)/actions"
import { SearchInput } from "./search-input"
import { Suspense } from "react"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Logo */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-stone-900">
                        Communew.
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
                        <Link href="/" className="hover:text-stone-900 transition-colors">
                            Explore
                        </Link>
                        <Link href="/about" className="hover:text-stone-900 transition-colors">
                            About
                        </Link>
                    </nav>
                </div>

                {/* Center: Search */}
                <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
                    <Suspense fallback={<div className="w-full h-9 bg-stone-100 rounded-full animate-pulse" />}>
                        <SearchInput />
                    </Suspense>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/host">
                        <Button variant="ghost" className="text-stone-600 hover:text-moss-700 hidden sm:inline-flex">
                            Host an Event
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-stone-200 hidden sm:block" />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block text-sm text-stone-600">
                                Welcome, <span className="font-semibold text-stone-900">{user.user_metadata?.full_name?.split(' ')[0] || "there"}!</span>
                            </div>
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="font-medium text-stone-900 gap-2">
                                    <User className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <form action={signout}>
                                <Button size="sm" variant="outline" className="text-stone-600 border-stone-300 hover:bg-stone-50">
                                    Sign out
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-medium text-stone-900">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="bg-moss-600 hover:bg-moss-700 text-white rounded-full px-5">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
