import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";

export default function EarningsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Earnings & Payouts</h1>
                <p className="text-stone-500">Track your revenue and manage payout methods.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-stone-900">€0.00</div>
                        <div className="flex items-center text-xs text-stone-500 mt-1 font-medium">
                            No revenue yet
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Pending Payout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-stone-900">€0.00</div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-stone-100 font-serif font-bold text-stone-900">
                    Recent Transactions
                </div>
                <div className="p-8 text-center text-stone-500 italic">
                    No transactions yet.
                </div>
            </div>
        </div>
    )
}
