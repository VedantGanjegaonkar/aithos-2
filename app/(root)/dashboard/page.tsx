// app/(root)/dashboard/page.tsx

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import SetupForm from "@/components/SetupForm"; 

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId as getAllUserInterviewsSorted,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";

const INTERVIEWS_LIMIT = 6;

async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id || '';
  const username = user?.name || '';
  
  // 1. Fetch all user interviews (Assumes action uses orderBy("createdAt", "desc"))
  const allUserInterviews = userId ? await getAllUserInterviewsSorted(userId) : [];

  // 2. Classify interviews by feedback status
  const feedbackChecks = await Promise.all(
    (allUserInterviews || []).map(async (iv) => {
      try {
        const fb = await getFeedbackByInterviewId({ interviewId: iv.id, userId });
        return { id: iv.id, hasFeedback: !!fb };
      } catch (e) {
        return { id: iv.id, hasFeedback: false };
      }
    })
  );

  const feedbackMap = new Map(feedbackChecks.map((f) => [f.id, f.hasFeedback]));
  
  // Separate into Upcoming (no feedback) and Past (has feedback)
  const upcomingInterviews = (allUserInterviews || []).filter((iv) => !feedbackMap.get(iv.id));
  const allPastInterviews = (allUserInterviews || []).filter((iv) => feedbackMap.get(iv.id));
  
  // Apply limit for the dashboard view
  const pastInterviewsToDisplay = allPastInterviews.slice(0, INTERVIEWS_LIMIT);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-20">
      
      {/* 🚀 1. SETUP SECTION: FORM RENDERED CONSTANTLY */}
      <section className="bg-dark-200 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Form Side: Takes 8 columns for plenty of space */}
          <div className="lg:col-span-8 p-8 md:p-12 space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">
                Setup your <span className="text-primary-200">Interview</span>
              </h1>
              <p className="text-gray-400">Configure your simulation parameters to start practicing immediately.</p>
            </div>
            
            {/* Inline Setup Form */}
            <SetupForm userId={userId} username={username} />
          </div>

          {/* Visual Side: Takes 4 columns */}
          <div className="lg:col-span-4 bg-gradient-to-br from-primary-200/10 to-transparent flex items-center justify-center p-8 max-lg:hidden border-l border-white/5">
            <div className="relative">
              {/* Subtle background glow for the robot */}
              <div className="absolute inset-0 bg-primary-200/20 blur-[80px] rounded-full animate-pulse" />
              <Image
                src="/aithos-robo-img.jpeg"
                alt="AI Interviewer"
                width={300}
                height={300}
                className="relative z-10 animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ⏳ 2. UPCOMING SESSIONS */}
      {userId && upcomingInterviews.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Upcoming Sessions</h2>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          
          {/* Explicit 3-column grid to fix card alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingInterviews.map((iv) => (
              <InterviewCard 
                key={iv.id} 
                {...iv} 
                interviewId={iv.id} 
                userId={userId} // userId placed last to prevent overwrite warning
              />
            ))}
          </div>
        </section>
      )}

      {/* ⏳ 3. RECENT PERFORMANCE (PAST INTERVIEWS) */}
      {userId && allPastInterviews.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-2xl font-bold text-white whitespace-nowrap">Recent Performance</h2>
                <div className="h-[1px] w-full bg-white/10" />
            </div>
            {allPastInterviews.length > INTERVIEWS_LIMIT && (
              <Link href="/history" className="ml-4 text-sm text-primary-200 hover:text-white transition-colors whitespace-nowrap">
                View Full History →
              </Link>
            )}
          </div>

          {/* Explicit 3-column grid for past interviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastInterviewsToDisplay.map((iv) => (
              <InterviewCard 
                key={iv.id} 
                {...iv} 
                interviewId={iv.id} 
                userId={userId} // userId placed last to prevent overwrite warning
              />
            ))}
          </div>
        </section>
      )}

      {/* Fallback if no activity exists at all */}
      {userId && upcomingInterviews.length === 0 && allPastInterviews.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl">
          <p className="text-gray-500 italic">No interview history found. Use the form above to start your first session.</p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
