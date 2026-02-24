import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveIban } from "./actions";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage(props: { searchParams?: Promise<{ error?: string, success?: string }> }) {
    const searchParams = props.searchParams ? await props.searchParams : {};

    const supabase = await createClient();
    if (!supabase) return <div>Database configuration error</div>;
    const { data: { user } } = await supabase.auth.getUser();

    let isMollieConnected = false;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('mollie_organization_id').eq('user_id', user.id).single();
        isMollieConnected = !!profile?.mollie_organization_id;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Settings</h1>
                <p className="text-stone-500">Manage your account preferences.</p>
            </div>

            {searchParams?.error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    <strong>Error:</strong> {searchParams.error}
                </div>
            )}

            {searchParams?.success === 'mollie_connected' && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                    <strong>Success!</strong> Your Mollie account is securely connected. You can now receive automated payouts.
                </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">

                <div>
                    <h3 className="font-medium text-stone-900 mb-4">Notifications</h3>
                    <div className="flex items-center justify-between py-3 border-b border-stone-100">
                        <div>
                            <div className="text-sm font-medium text-stone-900">Email Notifications</div>
                            <div className="text-xs text-stone-500">Receive updates about your bookings and events.</div>
                        </div>
                        <div className="h-6 w-11 bg-moss-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="font-medium text-stone-900 mb-4">Payments & Payouts</h3>
                    <div className="flex items-center justify-between py-3 border-t border-stone-100 mt-2 pt-4">
                        <div>
                            <div className="text-sm font-medium text-stone-900">Connect to Mollie</div>
                            <div className="text-xs text-stone-500 max-w-sm mt-1">
                                Receive automated payouts for your events and studio bookings.
                                We use Mollie Connect to securely split payments.
                            </div>
                        </div>
                        {isMollieConnected ? (
                            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                ✓ Connected
                            </div>
                        ) : (
                            <a href="/api/mollie/oauth">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Connect with Mollie
                                </Button>
                            </a>
                        )}
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="font-medium text-stone-900 mb-4 text-red-600">Danger Zone</h3>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        Delete Account
                    </Button>
                </div>

            </div>
        </div>
    )
}
