'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, Shield, Ban, Flag, CheckCircle, XCircle } from "lucide-react"
import { resolveReport, applyUserPenalty, toggleHostFlag } from "./actions"
import { approveEvent, rejectEvent } from "@/app/events/actions"
import { toast } from "sonner"

export function EventModerationButtons({ eventId }: { eventId: string }) {
    const [isSubmitting, setIsSubmitting] = useState<'approve' | 'reject' | null>(null)

    const handleAction = async (action: 'approve' | 'reject') => {
        setIsSubmitting(action)
        const res = action === 'approve' ? await approveEvent(eventId) : await rejectEvent(eventId)
        setIsSubmitting(null)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(`Event ${action}d`)
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleAction('reject')}
                disabled={!!isSubmitting}
            >
                {isSubmitting === 'reject' ? '...' : <><XCircle className="h-4 w-4 mr-1" /> Reject</>}
            </Button>
            <Button
                size="sm"
                className="bg-moss-600 hover:bg-moss-700 text-white"
                onClick={() => handleAction('approve')}
                disabled={!!isSubmitting}
            >
                {isSubmitting === 'approve' ? '...' : <><CheckCircle className="h-4 w-4 mr-1" /> Approve</>}
            </Button>
        </div>
    )
}

export function ReportResolutionDialog({ report }: { report: any }) {
    const [notes, setNotes] = useState('')
    const [enforcement, setEnforcement] = useState<'none' | 'warning' | 'suspension' | 'ban'>('none')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleResolve = async () => {
        setIsSubmitting(true)
        const res = await resolveReport(report.id, notes, enforcement)
        setIsSubmitting(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Report resolved successfully")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-moss-600 hover:text-moss-700 hover:bg-moss-50">View Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Resolve Report
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-stone-500 text-xs uppercase tracking-wider">Report Details</Label>
                        <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-bold text-stone-900 capitalize">{report.target_type} Report</span>
                                <Badge variant="outline" className="text-[10px]">{report.reason}</Badge>
                            </div>
                            <p className="text-sm text-stone-600 italic">"{report.details}"</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="level">Enforcement Level</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['none', 'warning', 'suspension', 'ban'] as const).map((level) => (
                                <Button
                                    key={level}
                                    type="button"
                                    variant={enforcement === level ? 'default' : 'outline'}
                                    className={`capitalize h-10 ${enforcement === level ? 'bg-stone-900' : ''}`}
                                    onClick={() => setEnforcement(level)}
                                >
                                    {level}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Admin Resolution Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Explain the resolution decision..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-24"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleResolve}
                        disabled={isSubmitting || !notes}
                        className="bg-moss-600 hover:bg-moss-700"
                    >
                        {isSubmitting ? 'Resolving...' : 'Complete Resolution'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function UserPenaltyDialog({ profile }: { profile: any }) {
    const [reason, setReason] = useState('')
    const [type, setType] = useState<'warning' | 'suspension' | 'ban'>('warning')
    const [duration, setDuration] = useState('7')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleApply = async () => {
        setIsSubmitting(true)
        const res = await applyUserPenalty(
            profile.user_id,
            type,
            reason,
            type === 'suspension' ? parseInt(duration) : undefined
        )
        setIsSubmitting(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(`Penalty applied: ${type}`)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-stone-600 hover:text-stone-900">Manage</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-stone-900" />
                        Manage User Penalty
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-stone-200 flex items-center justify-center font-serif text-lg">
                            {profile.full_name?.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-stone-900">{profile.full_name}</div>
                            <div className="text-xs text-stone-500">Host established {new Date().getFullYear()}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Penalty Type</Label>
                        <div className="flex gap-2">
                            {(['warning', 'suspension', 'ban'] as const).map((t) => (
                                <Button
                                    key={t}
                                    type="button"
                                    variant={type === t ? 'default' : 'outline'}
                                    className={`flex-1 capitalize ${type === t ? (t === 'ban' ? 'bg-red-600' : 'bg-stone-900') : ''}`}
                                    onClick={() => setType(t)}
                                >
                                    {t}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {type === 'suspension' && (
                        <div className="space-y-2">
                            <Label htmlFor="duration">Suspension Duration (Days)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="reason">Official Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="State the reason for this action..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <p className="text-[10px] text-stone-400 italic">This reason will be visible to the user in their notifications.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleApply}
                        disabled={isSubmitting || !reason}
                        className={type === 'ban' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-stone-900 text-white'}
                    >
                        {isSubmitting ? 'Applying...' : `Apply ${type}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function HostFlagButton({ profile }: { profile: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleToggle = async () => {
        setIsSubmitting(true)
        const res = await toggleHostFlag(profile.user_id, !profile.admin_flagged)
        setIsSubmitting(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(profile.admin_flagged ? "Flag removed" : "Host flagged for review")
        }
    }

    return (
        <Button
            size="sm"
            variant="outline"
            className={`h-7 text-[10px] h-fit py-0.5 px-2 ${profile.admin_flagged ? 'border-red-200 text-red-600 bg-red-50' : 'text-stone-400'}`}
            onClick={handleToggle}
            disabled={isSubmitting}
        >
            <Flag className={`h-3 w-3 mr-1 ${profile.admin_flagged ? 'fill-red-600' : ''}`} />
            {profile.admin_flagged ? 'Flagged' : 'Flag'}
        </Button>
    )
}
