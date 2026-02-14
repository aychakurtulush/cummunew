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
                        <div className="text-3xl font-bold text-stone-900">€2,450.00</div>
                        <div className="flex items-center text-xs text-moss-600 mt-1 font-medium">
                            <TrendingUp className="h-3 w-3 mr-1" /> +20% from last month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-stone-500">Pending Payout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-stone-900">€420.00</div>
                        <div className="flex items-center text-xs text-stone-500 mt-1">
                            Scheduled for Monday
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-moss-50 border-moss-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-moss-800">Payout Method</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <div>
                            <div className="font-bold text-moss-900">Stripe Connect</div>
                            <div className="text-xs text-moss-700">Ends in •••• 4242</div>
                        </div>
                        <Button size="sm" variant="outline" className="bg-white border-moss-200 text-moss-800 hover:bg-moss-100">Manage</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-stone-100 font-serif font-bold text-stone-900">
                    Recent Transactions
                </div>
                <div className="divide-y divide-stone-100">
                    {[
                        { id: 1, desc: "Payout #1024", date: "Feb 12", amount: "-€380.00", status: "Paid" },
                        { id: 2, desc: "Booking: Intro to Wheel Throwing", date: "Feb 11", amount: "+€45.00", status: "Cleared" },
                        { id: 3, desc: "Booking: Intro to Wheel Throwing", date: "Feb 11", amount: "+€45.00", status: "Cleared" },
                        { id: 4, desc: "Booking: Open Studio", date: "Feb 10", amount: "+€15.00", status: "Cleared" },
                    ].map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-stone-900 text-sm">{tx.desc}</div>
                                    <div className="text-xs text-stone-500">{tx.date}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold text-sm ${tx.amount.startsWith('-') ? 'text-stone-900' : 'text-moss-600'}`}>
                                    {tx.amount}
                                </div>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-stone-200 text-stone-500">
                                    {tx.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
