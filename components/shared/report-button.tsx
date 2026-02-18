"use client"

import { useState } from "react"
import { Flag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitReport } from "@/app/actions/report"
import { toast } from "sonner"

// Using native select for reliability unless I confirm Select component exists.
// Checking file list earlier: select.tsx was NOT in the list.
// So I will use a simple native <select> or just a set of buttons/radio.
// Let's use a native select for simplicity and speed.

interface ReportButtonProps {
    targetId: string
    targetType: 'event' | 'studio' | 'user'
    variant?: 'ghost' | 'outline' | 'default' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    buttonText?: string
}

export function ReportButton({ targetId, targetType, variant = "ghost", size = "sm", className, buttonText = "Report" }: ReportButtonProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)

        // Append hidden fields manually if needed, or rely on input type=hidden
        // But we can just use the form action directly.
        // Wait, if I use form action directly, I can't easily control the pending state in the same way or close the dialog on success without `useActionState` (React 19) or standard onSubmit.
        // Let's use a standard onSubmit handler that calls the action.

        const result = await submitReport(null, formData)

        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
            // If error is "must be logged in", we could redirect, but toast is okay for MVP.
        } else {
            toast.success(result.success)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <Flag className="h-4 w-4 mr-2" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <input type="hidden" name="targetId" value={targetId} />
                    <input type="hidden" name="targetType" value={targetType} />

                    <DialogHeader>
                        <DialogTitle>Report Content</DialogTitle>
                        <DialogDescription>
                            Help us understand the issue. Reports are anonymous to the content creator.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason</Label>
                            <select
                                id="reason"
                                name="reason"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select a reason</option>
                                <option value="spam">Spam or misleading</option>
                                <option value="inappropriate">Inappropriate content</option>
                                <option value="harassment">Harassment or hate speech</option>
                                <option value="other">Other issue</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="details">Details (Optional)</Label>
                            <Textarea
                                id="details"
                                name="details"
                                placeholder="Please provide more details..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
