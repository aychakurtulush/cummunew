import Image from "next/image";
import { cn } from "@/lib/utils";

interface AtmosphereBackgroundProps {
    variant?: "marble" | "stone";
    intensity?: "low" | "medium" | "high";
    className?: string;
}

export function AtmosphereBackground({
    variant = "marble",
    intensity = "low",
    className,
}: AtmosphereBackgroundProps) {
    // Opacity map based on intensity
    const opacityMap = {
        low: "opacity-[0.08]",
        medium: "opacity-[0.14]",
        high: "opacity-[0.20]",
    };

    return (
        <div
            className={cn(
                "absolute inset-0 pointer-events-none select-none overflow-hidden -z-10",
                className
            )}
            aria-hidden="true"
        >
            <div className={cn("absolute inset-0 w-full h-full mix-blend-multiply transition-opacity duration-700", opacityMap[intensity])}>
                <Image
                    src="/textures/marble.jpg"
                    alt=""
                    fill
                    className="object-cover grayscale-[0.2]"
                    priority
                    quality={85}
                />
            </div>

            {/* Soft gradient overlay to create depth/atmosphere and ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-stone-50/40" />
        </div>
    );
}
