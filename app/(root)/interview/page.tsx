// components/InterviewClientConsole.tsx
"use client";

import { useState } from 'react';
import Image from "next/image";
// Import Agent and CallStatus from the Agent component
import Agent, { CallStatus } from "@/components/Agent";
import InterviewTimer from "@/components/InterviewTimer";
import { getInstitutionLogoUrl as getInstitutionImageUrl } from "@/lib/utils";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { redirect } from 'next/navigation';

// Define the necessary prop types based on data fetched in the parent server component
interface InterviewData {
    role: string;
    type: string;
    techstack: string[];
    accessToken: string;
    callId: string;
    questions?: string[];
}

interface UserData {
    name: string;
    id: string; // The InterviewDetails server component ensures this is present
}

interface FeedbackData {
    id: string;
}

interface InterviewClientConsoleProps {
    interview: InterviewData;
    user: UserData;
    feedback: FeedbackData | null;
    interviewId: string;
}

const InterviewClientConsole = ({
    interview,
    user,
    feedback,
    interviewId
}: InterviewClientConsoleProps) => {
    // Client-side state for call status, passed to Agent and Timer
    const [currentCallStatus, setCurrentCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

    // Although the parent server component should ensure user exists,
    // we use redirect here defensively if data somehow gets lost in transit (optional, but safe)
    if (!user || !interview) redirect("/");

    return (
        <>
            <div className="flex flex-row gap-4 justify-between items-center">

                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex flex-row gap-4 items-center">
                        <Image
                            src={getInstitutionImageUrl(interview.role)}
                            alt="cover-image"
                            width={40}
                            height={40}
                            className="rounded-full object-cover size-[40px]"
                        />
                        <h3 className="capitalize text-light-100">{interview.role} Interview</h3>
                    </div>
                    <DisplayTechIcons techStack={interview.techstack} />
                </div>

                {/* Interview Timer and Type Badge */}
                <div className="flex items-center gap-4">
                    <InterviewTimer callStatus={currentCallStatus} />
                    <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit text-light-400 border border-border">
                        {interview.type}
                    </p>
                </div>
            </div>

            <Agent
                userName={user.name!}
                userId={user.id}
                interviewId={interviewId}
                type="interview"
                questions={interview.questions}
                feedbackId={feedback?.id}
                accessToken={interview.accessToken!}
                callId={interview.callId!}
                // FIX: Passing the required onStatusChange prop
                onStatusChange={setCurrentCallStatus}
            />
        </>
    );
};

export default InterviewClientConsole;