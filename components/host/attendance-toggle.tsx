"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toggleAttendance } from "@/app/host/events/actions"
import { toast } from "sonner"

interface AttendanceToggleProps {
    bookingId: string
    initialAttended: boolean
}

export function AttendanceToggle({ bookingId, initialAttended }: AttendanceToggleProps) {
    const [attended, setAttended] = useState(initialAttended)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setAttended(checked)
        setIsLoading(true)

        try {
            const result = await toggleAttendance(bookingId, checked)
            if (result.error) {
                // Revert on error
                setAttended(!checked)
                toast.error("Failed to update attendance")
            } else {
                toast.success(checked ? "Marked as attended" : "Marked as not attended")
            }
        } catch (error) {
            setAttended(!checked)
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={`attendance-${bookingId}`}
                checked={attended}
                onCheckedChange={handleToggle}
                disabled={isLoading}
            />
            <Label
                htmlFor={`attendance-${bookingId}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Attended
            </Label>
        </div>
    )
}
