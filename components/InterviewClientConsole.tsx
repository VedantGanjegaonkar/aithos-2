// components/InterviewClientConsole.tsx
"use client";

import { useState } from 'react';
import Image from "next/image";
// Import the necessary components and CallStatus enum
import Agent, { CallStatus } from "@/components/Agent"; 
import InterviewTimer from "@/components/InterviewTimer";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getInstitutionImageUrl } from "@/lib/utils";
import { redirect } from 'next/navigation';

// --- Data Interfaces (Match what the Server Component passes) ---
interface TechIcon {
    tech: string;
    url: string;
}

interface InterviewData {
    role: string;
    type: string;
    techIcons: TechIcon[]; // Array of resolved icon objects
    accessToken: string;
    callId: string;
    questions?: string[];
}

interface UserData {
    name: string;
    id: string; 
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
// ------------------------------------------------------------------

const InterviewClientConsole = ({ 
    interview, 
    user, 
    feedback, 
    interviewId 
}: InterviewClientConsoleProps) => {
    // Client-side state for call status, shared between Agent and Timer
    const [currentCallStatus, setCurrentCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

    // Defensive check (although the Server Component should ensure validity)
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
                    {/* DisplayTechIcons receives the pre-fetched, structured data */}
                    <DisplayTechIcons techIcons={interview.techIcons} />
                </div>
                
                {/* Interview Timer and Type Badge (Timer uses currentCallStatus) */}
                <div className="flex items-center gap-4">
                    <InterviewTimer callStatus={currentCallStatus} />
                    <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit text-light-400 border border-border">
                        {interview.type}
                    </p>
                </div>
            </div>

            {/* Agent component requires the onStatusChange prop */}
            <Agent
                userName={user.name!}
                userId={user.id}
                interviewId={interviewId}
                type="interview"
                questions={interview.questions}
                feedbackId={feedback?.id}
                accessToken={interview.accessToken!}
                callId={interview.callId!} 
                // FIX: Passing the state setter function to Agent
                onStatusChange={setCurrentCallStatus} 
            />
        </>
    );
};

export default InterviewClientConsole;