import React from 'react';

export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10 group">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-3">
                <span className="h-px w-6 bg-moss-200 group-hover:w-10 transition-all duration-300"></span>
                {title}
            </h2>
            <div className="text-stone-600 leading-relaxed space-y-4 pl-9">
                {children}
            </div>
        </section>
    );
}

export function PolicyHighlight({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-6 p-4 bg-moss-50 border-l-4 border-moss-500 text-stone-700 italic text-sm">
            {children}
        </div>
    );
}

export function LastUpdated({ date }: { date: string }) {
    return (
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-12">
            Last Updated // {date}
        </p>
    );
}

export function PolicyContainer({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6 sm:px-12">
            <header className="mb-16">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-4">{title}</h1>
                <div className="h-1 w-20 bg-moss-600"></div>
            </header>
            <div className="prose prose-stone max-w-none">
                {children}
            </div>
        </div>
    );
}
