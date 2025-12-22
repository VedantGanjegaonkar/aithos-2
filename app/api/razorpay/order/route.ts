import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  // 1. Check if keys exist before doing anything
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes("PLACEHOLDER")) {
    console.error("❌ RAZORPAY ERROR: Keys are missing or placeholders.");
    return NextResponse.json(
      { error: "Payments are currently disabled." }, 
      { status: 503 }
    );
  }

  try {
    // 2. Initialize inside the handler so it doesn't crash the build
    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

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
      notes: { userId, tokens },
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Order Created:", order.id);
    return NextResponse.json(order);
    
  } catch (error: any) {
    console.error("❌ RAZORPAY ORDER ERROR:", error);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}