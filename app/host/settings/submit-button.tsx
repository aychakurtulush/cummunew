'use client'

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export function SubmitStripeButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[170px]"
        >
            {pending ? "Connecting..." : "Connect with Stripe"}
        </Button>
    )
}
