import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/firebase/admin"; 
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Invalid Webhook Signature");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("📩 Webhook Event Received:", event.event);

    if (event.event === "order.paid" || event.event === "payment.captured") {
      // Razorpay sometimes puts notes in the payment object OR the order object
      const paymentEntity = event.payload.payment.entity;
      const orderEntity = event.payload.order?.entity;
      
      // Try to find notes in either place
      const notes = orderEntity?.notes || paymentEntity?.notes;
      const userId = notes?.userId || notes?.userid;
      const tokens = notes?.tokens;

      console.log(`🔍 Debug Info - UserId: ${userId}, Tokens: ${tokens}`);

      if (!userId || !tokens) {
        console.error("❌ Missing userId or tokens in Razorpay notes. Check your Order creation logic.");
        return NextResponse.json({ error: "Missing Metadata" }, { status: 400 });
      }

      const paymentId = paymentEntity.id;
      const paymentRef = db.collection("payments").doc(paymentId);
      const userRef = db.collection("users").doc(userId);

      // 2. IDEMPOTENCY CHECK
      const paymentDoc = await paymentRef.get();
      if (paymentDoc.exists) {
        console.log(`⚠️ Payment ${paymentId} already processed.`);
        return NextResponse.json({ status: "already_processed" });
      }

      // 3. DATABASE TRANSACTION
      await db.runTransaction(async (transaction) => {
        transaction.update(userRef, {
          credits: admin.firestore.FieldValue.increment(Number(tokens)),
          lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        transaction.set(paymentRef, {
          userId,
          tokens: Number(tokens),
          amount: paymentEntity.amount / 100,
          currency: paymentEntity.currency,
          paymentId: paymentId,
          orderId: paymentEntity.order_id,
          status: "completed",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log(`✅ Success: Added ${tokens} credits to User ${userId}`);
      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "ignored" });
  } catch (err: any) {
    console.error("❌ Webhook Runtime Error:", err.stack);
    return new Response("Internal Server Error", { status: 500 });
  }
}