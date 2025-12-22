"use server";

import { db } from "@/firebase/admin";

export async function getUserTransactions(userId: string) {
  try {
    const snapshot = await db
      .collection("payments")
      .where("userId", "==", userId)
      .orderBy("processedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount,
        tokens: data.tokens,
        status: data.status || "completed",
        // Format to string to avoid serialization errors with Firestore Timestamps
        date: data.processedAt?.toDate().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) || "Recent",
      };
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}