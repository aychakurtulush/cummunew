'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { contactSupport } from '@/app/messages/actions';
import { Loader2 } from 'lucide-react';

export function ContactSupportButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleContact = async () => {
        setIsLoading(true);
        try {
            const result = await contactSupport();
            if (result.error) {
                alert(result.error);
                return;
            }
            if (result.conversationId) {
                router.push(`/messages/${result.conversationId}`);
            }
        } catch (error) {
            alert('Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleContact}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-6 h-auto bg-moss-600 hover:bg-moss-500 text-white font-medium rounded-full transition-colors text-lg"
        >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Contact Support
        </Button>
    );
}
