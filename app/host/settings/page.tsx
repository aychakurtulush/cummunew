import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Settings</h1>
                <p className="text-stone-500">Manage your account preferences.</p>
            </div>

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
