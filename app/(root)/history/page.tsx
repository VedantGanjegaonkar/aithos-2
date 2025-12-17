import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/actions/general.action";
import HistoryListClient from "@/components/HistoryListClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const userId = user?.id || '';
  
  // Fetch interviews
  const rawInterviews = userId ? (await getInterviewsByUserId(userId)) || [] : [];
  
  // Fetch scores and handle 0 vs null properly
  const interviewsWithScores = await Promise.all(
    rawInterviews.map(async (iv: any) => {
      const feedback = await getFeedbackByInterviewId({ interviewId: iv.id, userId });
      
      return {
        id: iv.id,
        role: iv.role,
        type: iv.type,
        createdAt: iv.createdAt,
        // LOGIC: If feedback exists, use the score (defaulting to 0 if totalScore is 0).
        // If feedback record doesn't exist at all, return null.
        score: feedback ? (feedback.totalScore ?? 0) : null,
      };
    })
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white">
            Interview <span className="text-primary-200">History</span>
          </h1>
          <p className="text-gray-400 mt-2">Detailed breakdown of your AI-evaluated sessions.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <HistoryListClient initialData={interviewsWithScores} />
    </div>
  );
}