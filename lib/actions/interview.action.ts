"use server";

import { db } from "@/firebase/admin";

export async function createInterviewSession(params: {
  userId: string;
  username: string;
  targetSchool: string;
  program: string;
  focus: string;
  profileHighlights: string;
  amount: number;
  queueId?: string | null; // Added to handle direct deletion
}) {
  console.log(`🚀 Launching interview session for user: ${params.userId}`);

  try {
    // 1. Call your existing Generate API logic
    // We use the full URL to ensure the server-side fetch hits the correct route
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userid: params.userId,
        username: params.username,
        targetSchool: params.targetSchool,
        program: params.program,
        focus: params.focus,
        profileHighlights: params.profileHighlights,
        amount: params.amount,
        // Mapping fields to match your API's expected format
        role: params.targetSchool,
        type: params.program,
        level: "MBA",
        techstack: "General",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ API Generation Error: ${errorData.message}`);
      throw new Error(errorData.message || "Failed to generate agent");
    }

    const data = await response.json();

    // 2. CRITICAL: Cleanup the queue record
    // If the user came from the waiting room, we have a queueId.
    // If they started instantly, we might search by userId as a fallback.
    if (data.interviewId) {
      console.log(`✅ Agent Generated: ${data.interviewId}. Cleaning up queue...`);

      if (params.queueId) {
        // Direct deletion by ID (Most reliable)
        await db.collection("interview_queue").doc(params.queueId).delete();
        console.log(`🗑️ Queue Cleanup: Deleted document ${params.queueId}`);
      } else {
        // Fallback: Delete by userId if no queueId was provided (for Start Now cases)
        const snapshot = await db.collection("interview_queue")
          .where("userId", "==", params.userId)
          .get();
        
        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log(`🧹 Queue Cleanup: Removed ${snapshot.size} record(s) for user ${params.userId}`);
        }
      }
    }

    return data;
  } catch (error: any) {
    console.error("❌ Interview Session Error:", error.message);
    throw error;
  }
}