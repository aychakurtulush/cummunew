import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-moss-600 text-white shadow hover:bg-moss-700/80",
                secondary:
                    "border-transparent bg-stone-100 text-stone-900 hover:bg-stone-200/80",
                destructive:
                    "border-transparent bg-red-500 text-white hover:bg-red-600/80",
                outline: "text-stone-950 border-stone-200",
                terracotta:
                    "border-transparent bg-terracotta-100 text-terracotta-800 hover:bg-terracotta-200",
                mossLight:
                    "border-transparent bg-moss-50 text-moss-800 hover:bg-moss-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
