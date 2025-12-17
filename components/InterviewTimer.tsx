// components/InterviewTimer.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { CallStatus } from './Agent'; // Import the shared CallStatus enum
import { cn } from "@/lib/utils"; // Import cn utility for dynamic classes

interface InterviewTimerProps {
  callStatus: CallStatus;
}

const InterviewTimer = ({ callStatus }: InterviewTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Determine if the timer should be running (Connecting or Active)
    const shouldRun = 
      callStatus === CallStatus.CONNECTING || 
      callStatus === CallStatus.ACTIVE;

    // --- Timer START Logic ---
    if (shouldRun) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setElapsedSeconds(prevTime => prevTime + 1);
        }, 1000);
      }
    } 
    
    // --- Timer STOP/RESET Logic ---
    else if (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // If the call is INACTIVE (before it starts), reset the time.
      if (callStatus === CallStatus.INACTIVE) {
          setElapsedSeconds(0);
      }
    }

    // --- Cleanup function ---
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callStatus]); // Re-run effect whenever callStatus changes

  // Function to format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // --- NEW COLOR LOGIC ---
  const isRunning = callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING;
  
  // Use cn for dynamic styling of the container
  const containerClasses = cn(
    "bg-dark-200 px-4 py-2 rounded-lg h-fit border",
    {
      // Green border and text when running
      'border-green-500 text-green-500 font-bold': isRunning,
      // Default gray border and text when stopped
      'border-border text-gray-400': !isRunning,
    }
  );

  return (
    // Render the timer inside the new styled box
    <div className={containerClasses}>
      <p className="text-xl font-mono">
        {formatTime(elapsedSeconds)}
      </p>
    </div>
  );
};

export default InterviewTimer;