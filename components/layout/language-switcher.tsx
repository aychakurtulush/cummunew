'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const LOCALES = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function switchLocale(newLocale: string) {
        // Set cookie and reload so next-intl picks it up server-side
        document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=lax`;
        startTransition(() => {
            router.refresh();
        });
    }

    // Read current locale from the cookie
    const currentLocale =
        typeof document !== 'undefined'
            ? document.cookie
                .split('; ')
                .find(row => row.startsWith('NEXT_LOCALE='))
                ?.split('=')[1] ?? 'en'
            : 'en';

    return (
        <div className="flex items-center gap-0.5 rounded-full border border-stone-200 bg-stone-50 p-0.5">
            {LOCALES.map(({ code, label }) => {
                const isActive = currentLocale === code;
                return (
                    <button
                        key={code}
                        onClick={() => switchLocale(code)}
                        disabled={isPending || isActive}
                        aria-label={`Switch to ${label}`}
                        className={`
                            px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200
                            ${isActive
                                ? 'bg-stone-900 text-white shadow-sm'
                                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                            }
                            ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
