"use client";

import { useState } from 'react';
import Image from "next/image";
import { redirect } from 'next/navigation';

import Agent, { CallStatus } from "@/components/Agent"; 
import InterviewTimer from "@/components/InterviewTimer";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getInstitutionLogoUrl } from "@/lib/utils";

const InterviewClientConsole = ({ 
    interview, 
    user, 
    feedback, 
    interviewId 
}: any) => {
    const [currentCallStatus, setCurrentCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

    if (!user || !interview) redirect("/");

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 overflow-x-hidden">
            
            {/* --- HEADER BAR: Clean & Minimalist --- */}
            <header className="relative z-50 flex flex-row items-center justify-between bg-dark-200/80 backdrop-blur-xl p-4 md:px-8 md:py-5 rounded-3xl border border-white/10 shadow-2xl">
                
                {/* Left Side: School Info & Tech */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="relative shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2 border border-white/10 shadow-inner">
                        <Image
                            src={getInstitutionLogoUrl(interview.role)}
                            alt="Logo"
                            width={40}
                            height={40}
                            style={{ width: "auto", height: "auto" }} 
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-white font-bold truncate leading-tight text-lg">
                            {interview.role}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                             <p className="text-[10px] text-primary-200 uppercase tracking-widest font-black bg-primary-200/10 px-2 py-0.5 rounded border border-primary-200/20">
                                {interview.type}
                            </p>
                            <DisplayTechIcons techIcons={interview.techIcons} />
                        </div>
                    </div>
                </div>
                
                {/* Right Side: Timer & Status Only */}
                <div className="flex items-center gap-6 shrink-0">
                    {/* Timer only appears when call is active */}
                    <InterviewTimer callStatus={currentCallStatus} />
                    
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${currentCallStatus === CallStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {currentCallStatus === CallStatus.ACTIVE ? 'Live' : 'Ready'}
                        </span>
                    </div>
                </div>
            </header>

            {/* --- MAIN INTERFACE: The Agent --- */}
            <main className="relative z-10 w-full min-h-[550px] flex items-center justify-center bg-dark-200/40 rounded-[40px] border border-white/5 overflow-hidden shadow-inner">
                {/* Decoration: Ambient Background Glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-200/5 blur-[120px] rounded-full" />
                </div>
                
                {/* The Agent component handles its own Start/End button logic internally */}
                <div className="relative z-20 w-full flex flex-col items-center">
                    <Agent
                        userName={user.name!}
                        userId={user.id}
                        interviewId={interviewId}
                        type="interview"
                        questions={interview.questions}
                        feedbackId={feedback?.id}
                        accessToken={interview.accessToken!}
                        callId={interview.callId!} 
                        onStatusChange={setCurrentCallStatus} 
                    />
                </div>
            </main>
        </div>
    );
};

export default InterviewClientConsole;