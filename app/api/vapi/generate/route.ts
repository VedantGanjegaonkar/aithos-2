import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import Retell from "retell-sdk";

import { db } from "@/firebase/admin";
// FIX: Corrected import to the exported utility function
import { getInstitutionImageUrl } from "@/lib/utils"; 

// Initialize Retell Client
const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

export async function POST(request: Request) {
  const {
    role,
    type,
    techstack,
    level,
    amount,
    focus,
    targetSchool,
    program,
    profileHighlights,
    userid,
  } = await request.json();

  try {
    // -----------------------------------------------------------
    // 1. GENERATE QUESTIONS (GEMINI)
    // -----------------------------------------------------------
    const { text: questions } = await generateText({
      // FIX: Using a common, stable model
      model: google("gemini-2.5-flash"), 
      prompt: `
      Prepare questions for an MBA/PGDM admissions interview for top Indian business schools 
        such as the IIMs, XLRI, FMS, ISB, MDI and similar institutes.
        
        The target B-school and program is: ${targetSchool} - ${program}.
        The candidate's key profile highlights are: ${profileHighlights}.
        
        The focus of the questions should lean towards: ${focus}.
        Possible focus types are:
        - "personal & motivation" (why MBA, goals, self-awareness, strengths/weaknesses)
        - "academics" (undergraduate performance, academic rigour, concepts)
        - "work experience" (projects, impact, leadership at work, learning)
        - "current affairs & business awareness" (Indian economy, business news, policy)
        - "mixed" (balanced mix of all above)
        
        The interview style should simulate a rigorous panel interview at a top Indian B-school and 
        should implicitly evaluate the following dimensions:
        - Communication Skills
        - Analytical Ability
        - Motivation & Fit for ${targetSchool}
        - Leadership & Teamwork
        - Current Affairs & Business Awareness
        - Domain Knowledge (academics / work experience)
        - Ethics & Maturity
        - Professionalism
        
        The number of questions required is: ${amount}.
        
        Very important instructions:
        - first question should be always tell me about yourself or introduce yourself.
        - Please return ONLY the questions, without any extra explanation or text.
        - The questions are going to be read by a voice assistant, so do NOT use "/" or "*" 
          or any other special characters which might break the voice assistant.
        - Return the questions formatted exactly like this:
          ["Question 1", "Question 2", "Question 3"]

        
        Thank you! <3
    `,
    });

    const parsedQuestions = JSON.parse(questions);

    // -----------------------------------------------------------
    // 3. RETELL AI ROUTING
    // -----------------------------------------------------------
    const retellCall = await retell.call.createWebCall({
      agent_id: process.env.RETELL_AGENT_ID!,
    });
    
    // -----------------------------------------------------------
    // 2. SAVE TO FIREBASE
    // -----------------------------------------------------------
    const interview = {
      role: targetSchool,
      type: program,
      level: level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getInstitutionImageUrl(targetSchool), 
      createdAt: new Date().toISOString(),
      // CRITICAL FIX: SAVED THE ACCESS TOKEN TO FIREBASE
      accessToken: retellCall.access_token, 
    };

    const interviewRef = await db.collection("interviews").add(interview);


    // Return the access token so the frontend can start the audio
    return Response.json({ 
        success: true, 
        interviewId: interviewRef.id,
        accessToken: retellCall.access_token 
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Retell Agent Ready" }, { status: 200 });
}