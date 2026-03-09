'use client';

import { Globe, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareButton({ title, description }: { title: string, description?: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Use production URL if sharing, or current URL if localhost debugging
        const path = window.location.pathname;
        const productionUrl = `https://communew.com${path}`;

        const shareData = {
            title: title,
            text: description,
            url: productionUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or share failed, fallback to copy
                console.log("Share failed or cancelled, falling back to copy", err);
                copyToClipboard(productionUrl);
            }
        } else {
            copyToClipboard(productionUrl);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleShare}
            className="flex flex-1 flex-col items-center justify-center min-h-[56px] px-4 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 gap-1.5 text-xs font-medium text-stone-600 transition-colors"
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied</span>
                </>
            ) : (
                <>
                    <Globe className="h-4 w-4" />
                    <span>Share</span>
                </>
            )}
        </button>
    );
}
