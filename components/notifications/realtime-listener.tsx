"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function RealtimeListener() {
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const t = useTranslations('notifications');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, [supabase]);

    useEffect(() => {
        if (!userId) return;

        const channel = supabase.channel('realtime-notifications-toast')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const notification = payload.new;
                    
                    toast(notification.title || t('newNotification'), {
                        description: notification.message,
                        action: notification.link ? {
                            label: t('view'),
                            onClick: () => router.push(notification.link)
                        } : undefined,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase, router, t]);

    return null;
}
