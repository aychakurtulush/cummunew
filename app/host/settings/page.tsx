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

    let currentIban = "";
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('iban').eq('user_id', user.id).single();
        currentIban = profile?.iban || "";
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

            {searchParams?.success === 'iban_saved' && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                    <strong>Success!</strong> Your IBAN has been successfully saved. Payouts will be sent here.
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
                    <h3 className="font-medium text-stone-900 mb-4">Payouts (IBAN)</h3>
                    <div className="py-3 border-t border-stone-100 mt-2 pt-4">
                        <form action={saveIban} className="space-y-4 max-w-sm">
                            <div>
                                <Label htmlFor="iban" className="text-stone-700">Bank Account (IBAN)</Label>
                                <div className="text-xs text-stone-500 mb-2">
                                    This is where you will receive your payouts for events and studio bookings.
                                </div>
                                <Input
                                    id="iban"
                                    name="iban"
                                    placeholder="DE89 3704 0044 0532 0130 00"
                                    defaultValue={currentIban}
                                    required
                                />
                            </div>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                Save IBAN
                            </Button>
                        </form>
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
