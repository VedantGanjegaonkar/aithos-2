// app/(root)/interview/[id]/page.tsx

import { redirect } from "next/navigation";

// Import all necessary server-side functions
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getTechLogos } from "@/lib/utils"; // Fetch tech logos on the server

// Import the new Client Component
import InterviewClientConsole from "@/components/InterviewClientConsole"; 

// Server Component (must be async)
const InterviewDetails = async ({ params }: { params: { id: string } }) => {
  // 1. Data Fetching
  const { id } = params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);
  
  if (!user || !interview) redirect("/"); // Ensure user is available too

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id, // Use non-optional user.id here as we checked for user existence above
  });

  // Fetch tech icons and handle potential null/undefined return
  const fetchedTechIcons = await getTechLogos(interview.techstack);
  const techIcons = fetchedTechIcons || [];

  // 2. Prepare and pass props to the Client Component
  const interviewData = {
      role: interview.role,
      type: interview.type,
      techIcons: techIcons, // Pass the resolved array
      accessToken: interview.accessToken!,
      callId: interview.callId!, 
      questions: interview.questions,
  };

  const userData = {
      name: user.name!,
      id: user.id!,
  };

  // 3. Render the Client Component
  return (
    // FIX: Render the InterviewClientConsole, which handles the state and Agent.
    <InterviewClientConsole
      interview={interviewData}
      user={userData}
      feedback={feedback}
      interviewId={id}
    />
  );
};

export default InterviewDetails;