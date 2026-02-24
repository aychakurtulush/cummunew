import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage(props: { searchParams?: Promise<{ error?: string, success?: string }> }) {
    const searchParams = props.searchParams ? await props.searchParams : {};

    const supabase = await createClient();
    if (!supabase) return <div>Database configuration error</div>;
    const { data: { user } } = await supabase.auth.getUser();

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



            <Separator />

            <div>
                <h3 className="font-medium text-stone-900 mb-4 text-red-600">Danger Zone</h3>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                </Button>
            </div>

        </div>
    )
}
