import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function CommunitySkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-8 w-48" />
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-full w-2 bg-stone-100 rounded-full shrink-0" />
                                <Card className="flex-1 border-none shadow-sm">
                                    <CardContent className="p-0 flex flex-col sm:flex-row">
                                        <Skeleton className="w-full sm:w-48 h-32 sm:h-40 rounded-l-xl rounded-r-none" />
                                        <div className="p-5 flex-1 space-y-3">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-6 rounded-full" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-80 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    )
}
