'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteInquiry } from '@/app/host/inquiries/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function CancelInquiryButton({ inquiryId }: { inquiryId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleCancel = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteInquiry(inquiryId)
            if (result.success) {
                toast.success('Request cancelled successfully')
            } else {
                toast.error(result.error || 'Failed to cancel request')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-stone-500 border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    Cancel Request
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking Request?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel this request? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep Request</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
