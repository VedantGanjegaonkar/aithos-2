// components/InterviewCard.tsx
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
// FIX 1: Import getTechLogos
import { cn, getInstitutionImageUrl, getTechLogos } from "@/lib/utils";

import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

// Assuming InterviewCardProps is defined elsewhere
// interface InterviewCardProps {
//   interviewId: string;
//   userId: string;
//   role: string;
//   type: string;
//   techstack: string[]; // This is the raw array of tech names
//   createdAt: Date;
// }

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  // FIX 2: Fetch the resolved tech icons array here (Server-side)
  const techIcons = await getTechLogos(techstack);

  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const institutionImage = getInstitutionImageUrl(role); 

  return (
    // Replaced card-border and w-[360px] with the new semantic panel class
    // The panel class handles the w-80 (320px) width, gradient, and rounded corners.
    <div className="interview-card-panel w-[360px] max-sm:w-full">
      
      {/* --- Image Panel Section (Wraps the image to create the margin/padding) --- */}
      <div className="card-image-wrapper">
        <Image
          src={institutionImage} // <-- Uses the new deterministic function
          alt={`Campus image of ${role}`}
          width={500} // Width for filling the container
          height={200} // Set fixed height for the banner look
          className="card-image-panel" // Class for w-full, object-cover, and rounded-lg
        />
      </div>

      {/* --- Text Content Section (Handles padding and positions the absolute tag) --- */}
      <div className="card-content"> 
        
        {/* Interview Role (Main Title) */}
        {/* We use h2 and add " - MBA" for the new card look. Styling handled by CSS. */}
        <h2 className="text-xl font-bold mb-1">
          {role} - MBA
        </h2>

        {/* Date & Score (This becomes the detailed sub-text) */}
        <div className="flex flex-row gap-5 mt-1">
          {/* Calendar Date */}
          <div className="flex flex-row gap-2 items-center text-sm">
            <Image
              src="/calendar.svg"
              width={16}
              height={16}
              alt="calendar"
            />
            <p className="text-sm">{formattedDate}</p>
          </div>

          {/* Score */}
          <div className="flex flex-row gap-2 items-center text-sm">
            <Image src="/star.svg" width={16} height={16} alt="star" />
            <p className="text-sm">{feedback?.totalScore || "---"}/100</p>
          </div>
        </div>

        {/* Optional: Placeholder for a short detail line (like "A1 (CDC) | 35.22 LPA") */}
        <p className="line-clamp-2 mt-3">
          {/* Using the assessment as the primary content, similar to the original card's text */}
          {feedback?.finalAssessment ||
            "You haven't taken this interview yet. Take it now to improve your skills."}
        </p>
        
        {/* Corner Tag: Uses the normalizedType as the badge text */}
        <span className="card-placement-tag">
          {normalizedType.toUpperCase()} 
        </span>

      </div>
      
      {/* --- Footer (Tech Icons and Button) --- */}
      <div className="flex flex-row justify-between p-4 border-t border-gray-700/50">
        {/* FIX 3: Pass the resolved array with the correct prop name */}
        <DisplayTechIcons techIcons={techIcons} />

        <Button className="btn-primary">
          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            {feedback ? "Check Feedback" : "View Interview"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InterviewCard;