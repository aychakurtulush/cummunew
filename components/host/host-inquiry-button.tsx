'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { startConversation } from "@/app/messages/actions"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

export function HostInquiryButton({ hostId, hostName }: { hostId: string, hostName: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleInquiry = async () => {
        setIsSubmitting(true)
        // contextType 'inquiry' and contextId as hostId
        const res = await startConversation(hostId, 'inquiry', hostId)
        setIsSubmitting(false)

        if (res.error) {
            toast.error(res.error)
        } else if (res.conversationId) {
            router.push(`/messages/${res.conversationId}`)
        }
    }

    return (
        <Button
            variant="outline"
            className="w-full rounded-2xl h-12 border-stone-200 text-stone-700 font-bold hover:bg-stone-50 transition-all active:scale-95"
            onClick={handleInquiry}
            disabled={isSubmitting}
        >
            {isSubmitting ? 'Connecting...' : `Ask ${hostName?.split(' ')[0]} a question`}
        </Button>
    )
}
