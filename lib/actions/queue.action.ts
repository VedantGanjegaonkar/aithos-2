"use server";

import { db } from "@/firebase/admin";
import admin from "firebase-admin";
import { listLiveKitRooms } from "@/lib/livekit";

const MAX_CONCURRENCY = 5; 

export async function joinQueueOrStart(userId: string) {
  const queueRef = db.collection("interview_queue");

  // 1. Get live room concurrency from LiveKit
  const rooms = await listLiveKitRooms();
  const currentCount = rooms.length;

  console.log(`📊 Concurrency Check: ${currentCount}/${MAX_CONCURRENCY} calls active.`);

  // 2. Check if a queue ALREADY exists (Don't let people skip the line)
  const waitingQuery = await queueRef
    .where("status", "==", "waiting")
    .limit(1)
    .get();

  // 3. If space available AND no one is waiting, let them in
  if (currentCount < MAX_CONCURRENCY && waitingQuery.empty) {
    console.log("✅ System free. Starting interview...");
    return { action: "START_NOW" };
  }

  // 4. System full or Queue exists -> Add to queue
  console.log("⏳ System full. Enqueueing user...");
  
  const existing = await queueRef
    .where("userId", "==", userId)
    .where("status", "in", ["waiting", "reserved"])
    .limit(1)
    .get();

  if (!existing.empty) {
    return { action: "ENQUEUE", queueId: existing.docs[0].id };
  }

  const newDoc = await queueRef.add({
    userId,
    status: "waiting",
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: null
  });

  return { action: "ENQUEUE", queueId: newDoc.id };
}
