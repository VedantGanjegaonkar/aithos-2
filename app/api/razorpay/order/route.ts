import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, userId, tokens } = body;

    console.log("--- 🛒 ORDER API HIT ---");
    console.log("User:", userId, "Tokens:", tokens);

    if (!amount || !userId || !tokens) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId, tokens }, // 👈 Crucial: This gets sent to the webhook later
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Order Created:", order.id);
    return NextResponse.json(order);
    
  } catch (error: any) {
    console.error("❌ RAZORPAY ORDER ERROR:", error);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}