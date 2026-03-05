import { Skeleton } from "@/components/ui/skeleton"

export function ExploreSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
