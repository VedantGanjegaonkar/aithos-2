import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (!rawBody) return NextResponse.json({ error: "Empty" }, { status: 400 });

    let queueId: string | null = null;

    // Try parsing as JSON (standard fetch)
    try {
      const data = JSON.parse(rawBody);
      queueId = data.queueId;
    } catch (e) {
      // Fallback: Parse URL parameters (navigator.sendBeacon)
      const params = new URLSearchParams(rawBody);
      queueId = params.get("queueId");
    }

    if (!queueId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    console.log(`🗑️ Ghost Cleanup triggered for: ${queueId}`);
    await db.collection("interview_queue").doc(queueId).delete();
    console.log(`✅ Ghost Cleanup success: ${queueId}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("❌ Ghost Cleanup API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}