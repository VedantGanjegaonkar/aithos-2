import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserTransactions } from "@/lib/actions/payment.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ReceiptText,
    Calendar,
    CreditCard,
    CheckCircle,
    ArrowLeft,
    ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TransactionsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    const transactions = await getUserTransactions(user.id);

    return (
        <div className="min-h-screen bg-dark-100 pb-20">
            <div className="max-w-5xl mx-auto px-6 pt-32">

                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-500 hover:text-primary-200 text-xs font-bold uppercase tracking-widest transition-colors mb-4"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-white flex items-center gap-3">
                            <ReceiptText className="text-primary-200 w-10 h-10" />
                            Payment History
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your credits and view past invoices.</p>
                    </div>

                    <Link href="/pricing">
                        <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-6">
                            Buy More Tokens
                        </Button>
                    </Link>
                </div>

                {/* --- Transactions Table --- */}
                <div className="relative rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Date & Time</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Description</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Amount</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 text-sm text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 opacity-30" />
                                                {tx.date}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-primary-200" />
                                                    {tx.tokens} Interview Tokens
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono mt-1 group-hover:text-primary-200 transition-colors">
                                                    Ref: {tx.id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-white font-black text-lg">
                                            ₹{tx.amount}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">
                                                <CheckCircle className="w-3 h-3" />
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* --- EMPTY STATE --- */
                                <tr>
                                    <td colSpan={4} className="p-32 text-center">
                                        <div className="flex flex-col items-center max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                                <ShoppingBag className="w-10 h-10 text-gray-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
                                            <p className="text-gray-500 text-sm mb-8">
                                                You haven't purchased any interview tokens. Start your practice journey today!
                                            </p>
                                            <Link href="/pricing">
                                                <Button className="bg-primary-200 text-dark-300 font-bold px-8 hover:opacity-90">
                                                    View Pricing
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Footer Note --- */}
                <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest">
                    All transactions are secured and encrypted by Razorpay.
                </p>
            </div>
        </div>
    );
}