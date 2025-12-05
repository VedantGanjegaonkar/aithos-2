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

// Assuming types are defined elsewhere
// interface Interview {
//   id: string;
//   role: string;
//   type: string;
//   techstack: string[];
//   createdAt: Date;
// }

async function Home() {
  const user = await getCurrentUser();

  // Fetching data concurrently
  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 🚀 1. HERO SECTION (Enhanced card-cta) */}
      {/* Added py-24 for vertical padding, aligning with the large, high-impact feel */}
      <section className="card-cta py-24 max-sm:py-16">
        <div className="flex flex-col gap-6 max-w-lg">
          {/* Enhanced Headline: Larger, bolder, and uses primary accent color */}
          <h2 className="text-5xl font-extrabold text-primary-200">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>
          
          {/* Sub-headline: Adjusted for readability on a dark background */}
          <p className="text-lg text-gray-300">
            Practice real interview questions & get instant, personalized feedback on content, voice, and structure.
          </p>

          <SetupInterviewStarter userId={user?.id!} />
        </div>

        {/* Dynamic Robot Image: Added animation and drop-shadow for visual pop */}
        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          // Note: Assuming you have 'animate-float' defined in your utilities
          className="max-sm:hidden animate-float drop-shadow-2xl" 
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* ⏳ 2. YOUR PAST INTERVIEWS SECTION */}
      <section className="flex flex-col gap-6 mt-12">
        <div className="flex flex-col">
          {/* Enhanced Header: Using primary color */}
          <h2 className="text-3xl font-bold text-primary-200">Your Past Interviews</h2>
          {/* Visual Divider for better flow */}
          <div className="w-12 h-1 bg-primary-200 rounded-full mt-2 mb-4" /> 
        </div>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
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

      {/* ------------------------------------------------------------- */}
      {/* 📚 3. AVAILABLE INTERVIEWS SECTION */}
      <section className="flex flex-col gap-6 mt-12">
        <div className="flex flex-col">
          {/* Enhanced Header: Using primary color */}
          <h2 className="text-3xl font-bold text-primary-200">Practice Interviews</h2>
          {/* Visual Divider */}
          <div className="w-12 h-1 bg-primary-200 rounded-full mt-2 mb-4" /> 
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
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