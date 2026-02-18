'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { enGB } from 'date-fns/locale'

interface Notification {
    id: string
    title: string
    message: string
    link: string | null
    is_read: boolean
    created_at: string
    type: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        let channel: any;

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Initial fetch
            fetchNotifications(user.id)

            // Real-time subscription
            channel = supabase
                .channel('notifications_channel')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`, // Filter for current user
                    },
                    (payload) => {
                        console.log('New notification received:', payload)
                        fetchNotifications(user.id)
                        // Show a toast for immediate feedback
                        // toast("New notification received")
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Notification channel subscribed')
                    }
                })
        }

        setupSubscription()

        // Auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                fetchNotifications(session.user.id)
            }
        })

        return () => {
            if (channel) supabase.removeChannel(channel)
            subscription.unsubscribe()
        }
    }, [])

    const fetchNotifications = async (userId?: string) => {
        let currentUserId = userId;
        if (!currentUserId) {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            currentUserId = user.id
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Error fetching notifications:', error)
            return
        }

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        }
    }

    const handleMarkAsRead = async (notification: Notification) => {
        if (!notification.is_read) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id)

            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }

        if (notification.link) {
            setIsOpen(false)
            router.push(notification.link)
        }
    }

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length === 0) return

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds)

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-stone-600 hover:text-stone-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden bg-white/95 backdrop-blur-sm border-stone-200 shadow-xl rounded-xl">
                <div className="flex items-center justify-between p-4 bg-stone-50/50 border-b border-stone-100">
                    <span className="font-serif font-semibold text-stone-900">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-moss-600 hover:text-moss-700 font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                handleMarkAllRead();
                            }}
                        >
                            Mark all read
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-4 cursor-pointer border-b border-stone-100 last:border-0 hover:bg-stone-50 focus:bg-stone-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                onClick={() => handleMarkAsRead(notification)}
                            >
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`text-sm font-medium ${!notification.is_read ? 'text-stone-900' : 'text-stone-700'}`}>
                                            {notification.title}
                                        </span>
                                        {!notification.is_read && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    <span className="text-[10px] text-stone-400 font-medium pt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: enGB })}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
