"use server";

import { db } from "@/firebase/admin"; 
import { FieldValue } from "firebase-admin/firestore";

/**
 * Deducts 1 credit from the user. 
 * Defaults to 2 credits for new users.
 */
export async function consumeInterviewCredit(userId: string) {
  const userRef = db.collection("users").doc(userId);

  try {
    return await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      let currentCredits: number;

      if (!userDoc.exists) {
        // Initialize new user with 2 credits
        currentCredits = 1;
      } else {
        const userData = userDoc.data();
        currentCredits = userData?.credits !== undefined ? userData.credits : 1;
      }

      if (currentCredits < 1) {
        return { success: false, error: "Insufficient credits. Please top up to continue." };
      }

      const newCount = currentCredits - 1;

      // Update user credits
      transaction.set(userRef, { credits: newCount }, { merge: true });

      // Log transaction for audit trail
      const logRef = db.collection("creditTransactions").doc();
      transaction.set(logRef, {
        userId,
        amount: -1,
        type: "consumption",
        description: "MBA Mock Interview Session",
        createdAt: FieldValue.serverTimestamp()
      });

      return { success: true, remaining: newCount };
    });
  } catch (error: any) {
    console.error("Credit Error:", error);
    return { success: false, error: "Database transaction failed." };
  }
}

/**
 * Fetches current credit balance
 */
export async function getUserCredits(userId: string) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) return 1; 
        const data = userDoc.data();
        return data?.credits !== undefined ? data.credits : 1;
    } catch (error) {
        return 0;
    }
}