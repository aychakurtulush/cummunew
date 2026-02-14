import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-white py-12 text-sm text-stone-500">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-lg font-serif font-bold text-stone-900">Communew.</span>
                    <p className="max-w-xs text-center md:text-left">
                        Making Berlin feel a little more like home. Connect through shared hobbies.
                    </p>
                </div>

                <div className="flex gap-8 font-medium">
                    <Link href="/about" className="hover:text-col-900 transition-colors">About</Link>
                    <Link href="/host" className="hover:text-col-900 transition-colors">Host</Link>
                    <Link href="/privacy" className="hover:text-col-900 transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-col-900 transition-colors">Terms</Link>
                </div>

                <div className="text-xs text-stone-400">
                    &copy; {new Date().getFullYear()} Communew. Berlin.
                </div>
            </div>
        </footer>
    )
}
