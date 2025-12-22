import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    // Support both Retell and custom event types
    const event = payload.event || payload.event_type;

    if (event === "call_ended") {
      console.log("--------------------------------------------------");
      console.log("🧹 WEBHOOK HOUSEKEEPING: Cleaning expired spots...");

      const now = admin.firestore.Timestamp.now();
      
      /**
       * PART A: CLEANUP EXPIRED GHOSTS
       * Deletes users who were bumped to the "Green Screen" but never clicked start 
       * and their 5-minute window has closed.
       */
      const expiredSpots = await db.collection("interview_queue")
        .where("status", "==", "reserved")
        .where("timerEndsAt", "<", now)
        .get();

      if (!expiredSpots.empty) {
        const batch = db.batch();
        expiredSpots.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`✨ Removed ${expiredSpots.size} expired ghost spots.`);
      } else {
        console.log("ℹ️ No expired spots found.");
      }

      /**
       * PART B: BUMP NEXT USER
       * Since a call just ended (or we just cleared a ghost), 
       * we move the next person from 'waiting' to 'reserved'.
       */
      console.log("🔄 Finding next user in line...");
      const nextInLine = await db
        .collection("interview_queue")
        .where("status", "==", "waiting")
        .orderBy("joinedAt", "asc")
        .limit(1)
        .get();

      if (!nextInLine.empty) {
        const nextDoc = nextInLine.docs[0];
        
        // Calculate the 5-minute expiry window for the frontend timer
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 5);

        await nextDoc.ref.update({
          status: "reserved",
          reservedAt: admin.firestore.FieldValue.serverTimestamp(),
          timerEndsAt: admin.firestore.Timestamp.fromDate(expiryDate), 
        });

        console.log(`✅ Bumped User: ${nextDoc.data().userId} to reserved status.`);
      } else {
        console.log("ℹ️ Queue is now empty. No users to bump.");
      }
      console.log("--------------------------------------------------");
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}