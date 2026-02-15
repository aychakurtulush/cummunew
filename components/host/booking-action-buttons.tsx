'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { updateBookingStatus } from "@/app/events/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function BookingActionButtons({ bookingId }: { bookingId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleAction = async (status: 'confirmed' | 'declined') => {
        setIsLoading(true)
        try {
            const result = await updateBookingStatus(bookingId, status)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Request ${status}`)
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                className="border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-rose-600 h-8 w-8 p-0"
                onClick={() => handleAction('declined')}
                disabled={isLoading}
                title="Decline"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="border-moss-200 hover:bg-moss-50 hover:text-moss-700 text-moss-600 h-8 w-8 p-0"
                onClick={() => handleAction('confirmed')}
                disabled={isLoading}
                title="Confirm"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
        </div>
    )
}
