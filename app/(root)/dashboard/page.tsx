// app/(root)/dashboard/page.tsx

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
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

// Renamed from 'Home' to 'DashboardPage'
async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "";
  const username = user?.name || "";

  const [userInterviews, allInterview] = await Promise.all([
    userId ? getInterviewsByUserId(userId) : Promise.resolve([]),
    getLatestInterviews({ userId }),
  ]);

  // Classify interviews by whether feedback/transcript exists.
  const feedbackChecks = await Promise.all(
    (userInterviews || []).map(async (iv) => {
      try {
        const fb = await getFeedbackByInterviewId({
          interviewId: iv.id,
          userId,
        });
        return { id: iv.id, hasFeedback: !!fb };
      } catch (e) {
        return { id: iv.id, hasFeedback: false };
      }
    })
  );

  const feedbackMap = new Map(
    feedbackChecks.map((f) => [f.id, f.hasFeedback])
  );

  const upcomingInterviews = (userInterviews || []).filter(
    (iv) => !feedbackMap.get(iv.id)
  );

  const pastInterviews = (userInterviews || []).filter(
    (iv) => feedbackMap.get(iv.id)
  );

  // ✅ Limit past interviews to 6
  const limitedPastInterviews = pastInterviews.slice(0, 6);

  const hasUpcomingInterviews = upcomingInterviews.length > 0;
  const hasPastInterviews = limitedPastInterviews.length > 0;

  return (
    <>
      {/* 🚀 HERO SECTION */}
      <section className="card-cta py-24 max-sm:py-16">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-5xl font-extrabold text-primary-200">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>
          <p className="text-lg text-gray-300">
            Practice real interview questions & get instant, personalized
            feedback on content, voice, and structure.
          </p>
          <SetupInterviewStarter userId={userId} username={username} />
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden animate-float drop-shadow-2xl"
        />
      </section>

      {/* ⏳ UPCOMING INTERVIEWS */}
      {userId && (
        <section className="flex flex-col gap-6 mt-12">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-primary-200">
              Upcoming Interviews
            </h2>
            <div className="w-12 h-1 bg-primary-200 rounded-full mt-2 mb-4" />
          </div>

          <div className="interviews-section">
            {hasUpcomingInterviews ? (
              upcomingInterviews.map((interview) => (
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
              <p className="text-gray-400">
                You have no upcoming interviews scheduled.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ⏳ PAST INTERVIEWS */}
      {userId && (
        <section className="flex flex-col gap-6 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-primary-200">
                Your Past Interviews
              </h2>
              <div className="w-12 h-1 bg-primary-200 rounded-full mt-2" />
            </div>

            {/* ✅ View All Button */}
            {pastInterviews.length > 6 && (
              <Link href="/interviews">
                <Button variant="outline">View All</Button>
              </Link>
            )}
          </div>

          <div className="interviews-section">
            {hasPastInterviews ? (
              limitedPastInterviews.map((interview) => (
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
              <p className="text-gray-400">
                You haven&apos;t taken any interviews yet. Start one above!
              </p>
            )}
          </div>
        </section>
      )}
    </>
  );
}

export default DashboardPage;
