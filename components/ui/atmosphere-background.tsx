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
        low: "opacity-[0.06]",
        medium: "opacity-[0.12]",
        high: "opacity-[0.18]",
    };

    return (
        <div
            className={cn(
                "absolute inset-0 pointer-events-none select-none overflow-hidden -z-10",
                className
            )}
            aria-hidden="true"
        >
            <div className={cn("absolute inset-0 w-full h-full mix-blend-multiply", opacityMap[intensity])}>
                <Image
                    src="/textures/marble.webp"
                    alt=""
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />
                {/* Soft blur overlay to blend it even more */}
                <div className="absolute inset-0 backdrop-blur-[1px]" />
            </div>

            {/* Optional gradient overlay to ensure text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
    );
}
