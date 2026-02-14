import { Button } from "@/components/ui/button";
import { Search, Menu, User } from "lucide-react";

export default function LogoIdeasPage() {
    const directions = [
        {
            id: "classic-serif",
            name: "1. The Editorial Classic",
            fontClass: "font-serif font-bold tracking-tight",
            text: "Communew",
            desc: "Uses Fraunces/Serif. Timeless, established, warm. Current choice.",
        },
        {
            id: "modern-sans",
            name: "2. The Modern Minimalist",
            fontClass: "font-sans font-bold tracking-tight",
            text: "Communew",
            desc: "Uses Inter/Sans. Clean, tech-forward, simple.",
        },
        {
            id: "mixed-weight",
            name: "3. The Evolution",
            fontClass: "font-sans",
            render: () => (
                <span className="font-sans text-stone-900 tracking-tight">
                    <span className="font-normal text-stone-600">Commu</span>
                    <span className="font-extrabold text-stone-900">new</span>
                </span>
            ),
            desc: "Emphasizes 'new' with weight contrast. Suggests freshness.",
        },
        {
            id: "with-period",
            name: "4. The Statement",
            fontClass: "font-serif font-bold tracking-tight",
            text: "Communew.",
            desc: "Adds a period for confidence and finality. 'The destination'.",
        },
        {
            id: "lowercase-modern",
            name: "5. The Friendly Local",
            fontClass: "font-sans font-semibold tracking-tight lowercase",
            text: "communew",
            desc: "All lowercase. Approachable, humble, community-focused.",
        },
    ];

    return (
        <div className="min-h-screen bg-stone-100 p-8 font-sans space-y-20">

            <div className="max-w-4xl mx-auto text-center space-y-4">
                <h1 className="text-3xl font-bold text-stone-900">Communew Brand Exploration</h1>
                <p className="text-stone-500">Comparing typographic directions in context.</p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {directions.map((dir) => (
                    <div key={dir.id} className="space-y-6">
                        <div className="border-b border-stone-300 pb-2 mb-4">
                            <h2 className="text-lg font-medium text-stone-900">{dir.name}</h2>
                            <p className="text-sm text-stone-500">{dir.desc}</p>
                        </div>

                        {/* Context 1: Navbar (Desktop) */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                            <div className="bg-stone-50 px-4 py-2 text-xs text-stone-400 font-mono uppercase tracking-wider border-b border-stone-100">
                                Desktop Navigation
                            </div>
                            <div className="px-6 py-4 flex items-center justify-between">
                                <div className={`text-2xl text-stone-900 ${dir.fontClass}`}>
                                    {dir.render ? dir.render() : dir.text}
                                </div>
                                <div className="flex gap-4 text-sm font-medium text-stone-500">
                                    <span>Explore</span>
                                    <span>About</span>
                                    <span className="text-stone-900">Log in</span>
                                    <span className="bg-stone-900 text-white px-3 py-1 rounded-full text-xs">Sign up</span>
                                </div>
                            </div>
                        </div>

                        {/* Context 2: Hero Section (Impact) */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden relative">
                            <div className="bg-stone-50 px-4 py-2 text-xs text-stone-400 font-mono uppercase tracking-wider border-b border-stone-100">
                                Hero / Marketing
                            </div>
                            <div className="bg-stone-900 text-white px-8 py-16 text-center">
                                <div className="mb-6 opacity-80">
                                    <div className={`text-4xl md:text-6xl ${dir.fontClass}`}>
                                        {dir.render ? dir.render() : dir.text}
                                    </div>
                                </div>
                                <h3 className="text-xl font-medium opacity-90 mb-6">Discover local hobbies.</h3>
                                <button className="bg-white text-stone-900 px-6 py-3 rounded-full font-medium text-sm">
                                    Get Started
                                </button>
                            </div>
                        </div>

                        {/* Context 3: Mobile & Icon */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                                <div className="bg-stone-50 px-4 py-2 text-xs text-stone-400 font-mono uppercase tracking-wider border-b border-stone-100">
                                    Mobile Nav
                                </div>
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <Menu className="h-5 w-5 text-stone-600" />
                                    <div className={`text-lg text-stone-900 ${dir.fontClass}`}>
                                        {dir.render ? dir.render() : dir.text}
                                    </div>
                                    <User className="h-5 w-5 text-stone-600" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden flex flex-col items-center p-4">
                                <div className="bg-stone-50 mb-2 px-2 py-1 text-xs text-stone-400 font-mono uppercase tracking-wider rounded">
                                    App Icon (Favicon)
                                </div>
                                <div className="h-16 w-16 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <span className={`text-2xl ${dir.fontClass}`}>
                                        {dir.id === 'lowercase-modern' ? 'c' : 'C'}
                                        {dir.id === 'with-period' ? '.' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Context 4: Moss Variant */}
                        <div className="bg-moss-50 rounded-lg shadow-sm border border-moss-100 overflow-hidden p-6 text-center">
                            <div className="text-xs text-moss-600 font-mono uppercase tracking-wider mb-2">Color Usage</div>
                            <div className={`text-3xl text-moss-800 ${dir.fontClass}`}>
                                {dir.render ? dir.render() : dir.text}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
