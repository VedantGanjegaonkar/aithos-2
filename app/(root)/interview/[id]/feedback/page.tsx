import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import GenerateFeedbackButton from "@/components/GenerateFeedbackButton"; // Import the button

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // Try to fetch existing feedback
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  // --- CASE: Feedback doesn't exist yet ---
  if (!feedback) {
    return (
      <div className="section-feedback flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-4xl font-semibold">
          Feedback Not Found
        </h1>
        <p className="mt-4 text-gray-400 max-w-lg">
          The feedback for this interview hasn&apos;t been generated yet. 
          {interview.callId ? " We found a Call ID, so you can generate it now." : " No Call ID found."}
        </p>

        {/* Show Manual Generate Button if Call ID exists */}
        {interview.callId && (
            <div className="mt-8 p-6 border border-gray-700 rounded-xl bg-dark-300 w-full max-w-md">
                <h3 className="text-lg font-bold mb-2">Generate Analysis</h3>
                <p className="text-sm text-gray-400 mb-4">
                    Fetch transcript from Retell (Call ID: {interview.callId.slice(0, 8)}...) and run AI analysis.
                </p>
                
                <GenerateFeedbackButton 
                    interviewId={id} 
                    userId={user?.id!} 
                    callId={interview.callId} 
                />
            </div>
        )}

        <div className="mt-8">
          <Button className="btn-secondary">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- CASE: Feedback Exists (Normal Display) ---
  return (
    <section className="section-feedback">
       {/* ... (Keep your existing code for displaying feedback/transcript here) ... */}
       {/* ... Same as previous version ... */}
       
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview - <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>Overall Impression: <span className="text-primary-200 font-bold">{feedback.totalScore}</span>/100</p>
          </div>
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>{feedback.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A") : "N/A"}</p>
          </div>
        </div>
      </div>

      <hr />
      <p>{feedback.finalAssessment}</p>

      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback.categoryScores?.map((category, index) => (
          <div key={index}>
            <p className="font-bold">{index + 1}. {category.name} ({category.score}/100)</p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>
       
       <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">Back to dashboard</p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;