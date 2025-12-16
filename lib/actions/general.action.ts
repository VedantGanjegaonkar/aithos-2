"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import Retell from "retell-sdk"; 

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, callId, feedbackId } = params;

  try {
    console.log(`[FEEDBACK] 🟢 Starting Feedback Process for Call ID: ${callId}`);

    let retellTranscript: any[] = [];
    let attempts = 0;
    const maxAttempts = 10; 
    const delayMs = 2000;  

    // --- POLLING MECHANISM ---
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[FEEDBACK] 🔄 Polling Retell API (Attempt ${attempts}/${maxAttempts})...`);
      
      const callResponse = await retell.call.retrieve(callId);
      
      if (callResponse.call_status === "ended") {
        console.log(`[FEEDBACK] ✅ Call Status is 'ended'. Fetching transcript...`);
        retellTranscript = callResponse.transcript_object || [];
        
        if (retellTranscript.length > 0) {
            break; 
        } else {
            console.log(`[FEEDBACK] ⚠️ Call ended but transcript is empty. Waiting...`);
        }
      } else {
        console.log(`[FEEDBACK] ⏳ Call status is '${callResponse.call_status}'. Waiting...`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    if (retellTranscript.length === 0) {
        console.warn(`[FEEDBACK] ❌ Failed to retrieve transcript after polling.`);
    }

      // --- TRANSCRIPT PARSING FOR GEMINI ---
      // We parse the raw `retellTranscript` (which contains `role`, `content`, `words`, etc.)
      // into a compact, predictable string that reduces tokens sent to the model and avoids overloads.
      function prepareTranscriptForGemini(
        raw: any[],
        opts: { maxMessages?: number; maxCharsPerMessage?: number } = {}
      ) {
        const { maxMessages = 12, maxCharsPerMessage = 220 } = opts;

        if (!Array.isArray(raw) || raw.length === 0) return "";

        // Map and normalize roles/content, remove low-value fields
        const normalized = raw.map((item: any) => ({
          role: item.role === "agent" ? "assistant" : "user",
          // Some transcripts include `content` nested or empty; coalesce safely
          content: (item.content || item.text || "").replace(/\s+/g, " ").trim(),
        })).filter((m) => m.content && m.content.length > 0);

        // Collapse consecutive messages by same role to reduce redundancy
        const collapsed: { role: string; content: string }[] = [];
        for (const msg of normalized) {
          const last = collapsed[collapsed.length - 1];
          if (last && last.role === msg.role) {
            // join with space, but avoid growing too large
            last.content = `${last.content} ${msg.content}`.slice(0, maxCharsPerMessage * 3);
          } else {
            collapsed.push({ ...msg });
          }
        }

        // Keep only the last N messages (most relevant) but also preserve some leading context if short
        const start = Math.max(0, collapsed.length - maxMessages);
        const slice = collapsed.slice(start);

        // Truncate per message to maxCharsPerMessage, keep ellipsis for clarity
        const compact = slice.map((m) => {
          let c = m.content;
          if (c.length > maxCharsPerMessage) {
            c = c.slice(0, maxCharsPerMessage - 1).trim() + "…";
          }
          return `- ${m.role}: ${c}\n`;
        }).join("");

        return compact;
      }

      const transcript = retellTranscript.map((item: any) => ({
        role: item.role === "agent" ? "assistant" : "user",
        content: (item.content || item.text || "").replace(/\s+/g, " ").trim(),
      }));

      const compactTranscript = prepareTranscriptForGemini(retellTranscript, { maxMessages: 12, maxCharsPerMessage: 220 });

      console.log(`[FEEDBACK] 🤖 Starting Gemini analysis on ${retellTranscript.length} messages (compact ${compactTranscript.length} chars)...`);

    // --- GEMINI ANALYSIS ---
    const { object } = await generateObject({
      // Use Gemini model with structuredOutputs enabled so Zod schemas are handled natively
      model: google("gemini-2.5-flash"),

      // Use the Zod schema from constants - generateObject expects a Zod schema here
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${compactTranscript}

        Please score the candidate from 0 to 100 in the following areas:
        - Communication Skills
        - Analytical Ability
        - Motivation & Fit
        - Leadership & Teamwork
        - Current Affairs & Business Awareness
        - Domain Knowledge
        - Ethics & Maturity
        - Professionalism
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Save to Firebase
    // Validate the Gemini response against our Zod schema before saving
    console.log(`[FEEDBACK] 🔎 Validating Gemini response...`);
    const parsed = feedbackSchema.safeParse(object);

    if (!parsed.success) {
      console.error(`[FEEDBACK] ❌ Schema validation failed:`, parsed.error);
      try {
        // Persist raw response for debugging
        await db.collection("feedback_raw").doc().set({
          interviewId,
          userId,
          callId,
          rawResponse: object,
          validationError: parsed.error.format ? parsed.error.format() : String(parsed.error),
          createdAt: new Date().toISOString(),
        });
        console.log(`[FEEDBACK] 💾 Saved raw invalid response to 'feedback_raw' collection.`);
      } catch (saveErr) {
        console.error(`[FEEDBACK] ⚠️ Failed to save raw response:`, saveErr);
      }

      return { success: false };
    }

    const feedbackObj = parsed.data;

    const feedback = {
      interviewId,
      userId,
      totalScore: feedbackObj.totalScore,
      categoryScores: feedbackObj.categoryScores,
      strengths: feedbackObj.strengths,
      areasForImprovement: feedbackObj.areasForImprovement,
      finalAssessment: feedbackObj.finalAssessment,
      createdAt: new Date().toISOString(),
      transcript: transcript,
    };

    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);
    console.log(`[FEEDBACK] 💾 Saved feedback ID: ${feedbackRef.id}`); 

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error(`[FEEDBACK] 💥 CRITICAL ERROR:`, error); 
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  
  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  // Firestore requires a composite index for combining `where` on one field with `orderBy` on another.
  // To avoid that during development, fetch recent interviews ordered by `createdAt` and
  // filter `finalized` and `userId` in memory. This avoids the index requirement.
  const snapshot = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .limit(limit * 4)
    .get();

  const results = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((iv: any) => iv.finalized === true && iv.userId !== userId)
    .slice(0, limit) as Interview[];

  return results;
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db.collection("interviews")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc") // <-- ADDED: Ensure interviews are sorted newest first
        .get();
        
    if (interviews.empty) return null;

    return interviews.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Interview[];
}