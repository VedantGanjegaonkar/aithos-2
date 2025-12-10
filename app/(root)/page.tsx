// ved-pandya/test_aithos/test_aithos-7f98104aa6f9ba6e2d00a371a5d6ac4e96919a19/app/(root)/page.tsx

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import SetupInterviewStarter from "@/components/SetupInterviewStarter";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();
  // FIX: Use empty string if user is null to prevent Firestore errors
  const userId = user?.id || ''; 
  
  // FIX: Conditionally fetch userInterviews ONLY if userId is NOT an empty string
  const [userInterviews, allInterview] = await Promise.all([
    userId ? getInterviewsByUserId(userId) : Promise.resolve([]), 
    // FIX: Pass userId which is now guaranteed to be a string ('id' or '')
    getLatestInterviews({ userId }), 
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <>
      {/* 🚀 1. HERO SECTION (Always visible) */}
      <section className="card-cta py-24 max-sm:py-16">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-5xl font-extrabold text-primary-200">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>
          <p className="text-lg text-gray-300">
            Practice real interview questions & get instant, personalized feedback on content, voice, and structure.
          </p>
          {/* userId is passed: if logged out, it's an empty string. */}
          <SetupInterviewStarter userId={userId} /> 
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden animate-float drop-shadow-2xl" 
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* ⏳ 2. YOUR PAST INTERVIEWS SECTION (CONDITIONAL: Only if user is logged in) */}
      {userId && ( // <-- Only show this section if userId exists
        <section className="flex flex-col gap-6 mt-12">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-primary-200">Your Past Interviews</h2>
            <div className="w-12 h-1 bg-primary-200 rounded-full mt-2 mb-4" /> 
          </div>

          <div className="interviews-section">
            {hasPastInterviews ? (
              userInterviews?.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={userId}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
              <p className="text-gray-400">You haven&apos;t taken any interviews yet. Start one above!</p>
            )}
          </div>
        </section>
      )}


      {/* ------------------------------------------------------------- */}
      {/* 📚 3. AVAILABLE INTERVIEWS SECTION (Always visible) */}
      <section className="flex flex-col gap-6 mt-12">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-primary-200">Practice Interviews</h2>
          <div className="w-12 h-1 bg-primary-200 rounded-full mt-2 mb-4" /> 
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={userId} 
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-400">There are no featured interviews available right now.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;