"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface SheetProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const SheetContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => { } });

const Sheet = ({ children, open: controlledOpen, onOpenChange }: SheetProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = (newOpen: boolean) => {
        if (!isControlled) setUncontrolledOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <SheetContext.Provider value={{ open, setOpen }}>
            {children}
        </SheetContext.Provider>
    );
};

const SheetTrigger = ({ asChild, children }: { asChild?: boolean, children: React.ReactNode }) => {
    const { setOpen } = React.useContext(SheetContext);

    // If asChild is true, we clone the element and attach onClick.
    // We assume the child accepts onClick and is a valid Element.
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                // Call original onClick if it exists
                const originalOnClick = (children.props as any).onClick;
                if (originalOnClick) {
                    originalOnClick(e);
                }
                setOpen(true);
            }
        });
    }

    return (
        <button onClick={() => setOpen(true)}>
            {children}
        </button>
    );
};

const SheetContent = ({ children, side = "right", className }: { children: React.ReactNode, side?: "left" | "right", className?: string }) => {
    const { open, setOpen } = React.useContext(SheetContext);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-start"> {/* z-50 is standard for modals */}
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <div className={cn(
                "fixed z-50 flex h-full w-3/4 flex-col overflow-y-auto bg-white p-6 shadow-xl transition-transform duration-300 animate-in slide-in-from-left sm:max-w-sm",
                side === "left" ? "left-0 top-0 border-r" : "right-0 top-0 border-l",
                className
            )}>
                <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-stone-100">
                    <button onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
};

const SheetHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    >
        {children}
    </div>
)

const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold text-stone-950", className)}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };
