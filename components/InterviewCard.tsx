// components/InterviewCard.tsx
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { getInstitutionLogoUrl, getTechLogos } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

interface InterviewCardProps {
  interviewId: string;
  userId: string;
  role: string;
  type: string;
  techstack: string[] | string;
  createdAt: string | Date;
}

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const techIcons = await getTechLogos(techstack);
  const feedback = userId && interviewId
      ? await getFeedbackByInterviewId({ interviewId, userId })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(createdAt || Date.now()).format("MMM D, YYYY");
  
  // Safety: Ensure logoUrl is never an empty string
  const logoUrl = getInstitutionLogoUrl(role) || `https://ui-avatars.com/api/?name=${encodeURIComponent(role)}`; 

  return (
    <div className="card-border w-full h-full group animate-fadeIn">
      <div className="card flex flex-col justify-between overflow-hidden h-full">
        
        {/* Header/Logo Section */}
        <div className="relative w-full h-44 bg-white/[0.03] flex items-center justify-center p-10 overflow-hidden">
          <div className="absolute inset-0 bg-primary-200/5 blur-[50px] rounded-full" />
          
          <div className="relative w-28 h-28 transition-transform duration-500 group-hover:scale-110">
            <Image
              src={logoUrl}
              alt={`${role} logo`}
              fill
              sizes="112px" 
              className="object-contain relative z-10"
              priority={false}
            />
          </div>

          <div className="absolute top-4 right-4 bg-primary-200 text-dark-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
            {normalizedType}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">
            {role} <span className="text-primary-200/80">- MBA</span>
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Image src="/calendar.svg" width={14} height={14} alt="calendar icon" className="opacity-50" />
              <p className="text-xs text-gray-400">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Image src="/star.svg" width={14} height={14} alt="score icon" className="opacity-50" />
              <p className="text-xs text-primary-200 font-bold">
                {feedback?.totalScore !== undefined ? `${feedback.totalScore}/100` : "---"}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-6 italic">
            &quot;{feedback?.finalAssessment || 
              "Session pending. Complete the interview to receive your AI-powered performance breakdown."}
            &quot;
          </p>

          {/* Footer Area */}
          <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
            <DisplayTechIcons techIcons={techIcons} />

            <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
              <Button className="btn-primary scale-90 origin-right transition-all">
                {feedback ? "Feedback" : "Resume"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;