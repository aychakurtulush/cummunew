import { getInquiriesForHost } from "./actions";
import { InquiryCard } from "@/components/host/inquiry-card";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function HostInquiriesPage() {
    const inquiries = await getInquiriesForHost();
    const t = await getTranslations('host');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900">{t('nav.inquiries')}</h1>
                <p className="text-stone-500">{t('inquiriesSubtitle')}</p>
            </div>

            {inquiries.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-stone-500">
                        <div className="h-12 w-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="h-6 w-6 text-stone-400" />
                        </div>
                        <h3 className="font-semibold text-lg text-stone-900">{t('noInquiries')}</h3>
                        <p>{t('noInquiriesSubtitle')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {inquiries.map((inquiry: any) => (
                        <InquiryCard key={inquiry.id} inquiry={inquiry} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Client component for interactivity (approve/reject) would be better extracted,
// strictly server component here can't handle onClick.
// We'll make a small client "InquiryCard" wrapper or form.
// Actually, let's use a Form with server actions for simplicity if possible,
// or simpler: make this whole page client or extract the card.
// Let's create `components/host/inquiry-card.tsx` separately or inline a client component here if allowed (Next.js doesn't allow inline client components in server file easily).
// I'll create a separate file `components/host/inquiry-card.tsx`.
