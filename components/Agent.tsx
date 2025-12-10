"use client";

import React from "react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// CRITICAL FIX: Using the correct client name (capital 'C')
import { RetellWebClient } from "retell-client-js-sdk"; 

import { cn } from "@/lib/utils";
// Removed VAPI Imports
import { createFeedback } from "@/lib/actions/general.action";

// Assuming AgentProps interface includes accessToken (from types/index.d.ts)
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AgentProps {
    userName: string;
    userId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
    // REQUIRED: The access token from the backend Retell call
    accessToken: string; 
}


const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  accessToken, // Destructure the required prop
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  
  // Use useRef to hold the Retell client instance
  const retellClientRef = useRef<RetellWebClient | null>(null);


  // --- Step 1: Initialize Retell Client and Set up Listeners ---
  useEffect(() => {
    // Only initialize if the client is not yet set
    if (!retellClientRef.current) {
      
      // CRITICAL FIX: RetellWebClient is instantiated without arguments
      retellClientRef.current = new RetellWebClient(); 

      // Retell Event Handlers (Replacing Vapi logic)
      const onConnect = () => {
        console.log("Retell Call Started");
        setCallStatus(CallStatus.ACTIVE);
      };

      const onStop = () => {
        console.log("Retell Call Ended");
        setCallStatus(CallStatus.FINISHED);
      };

      const onError = (error: Error) => {
        console.log("Retell Error:", error);
        setCallStatus(CallStatus.FINISHED);
      };

      // Handle final transcript messages from Retell (using 'any' for unknown event type)
      const onMessage = (message: any) => { 
        if (message.event === "message" && message.message) {
            const { role, content } = message.message;
            if (role === 'agent' || role === 'user') {
                const newMessage: SavedMessage = { role: role === "agent" ? "assistant" : "user", content: content };
                setMessages((prev) => [...prev, newMessage]);
            }
        }
      };
      
      // Handle audio state (speaking indicator)
      const onAudio = (event: any) => {
          if (event.event === "audio" && event.audio) {
            setIsSpeaking(event.audio.role === "agent");
          }
      }

      // Wire up the event listeners
      const client = retellClientRef.current;
      client.on("connect", onConnect);
      client.on("stop", onStop);
      client.on("error", onError);
      client.on("message", onMessage);
      client.on("audio", onAudio);
    }
    
    // Cleanup function: remove listeners and stop the call if component unmounts
    return () => {
        if (retellClientRef.current) {
            const client = retellClientRef.current;
            client.off("connect");
            client.off("stop");
            client.off("error");
            client.off("message");
            client.off("audio");

            // Use the correct stop method
            if (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING) {
                 client.stopCall();
            }
        }
    };
  }, [callStatus]); // Removed accessToken dependency here as it's passed to .startCall()


  // --- Step 2: Handle Feedback Generation on Call End ---
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      handleGenerateFeedback(messages);
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // --- Step 3: Handle Button Actions (Start the Call) ---
  
  const handleCall = () => {
    if (retellClientRef.current && callStatus === CallStatus.INACTIVE) {
        setCallStatus(CallStatus.CONNECTING);
        
        // CRITICAL FIX: accessToken is passed to the startCall method
        retellClientRef.current.startCall({ accessToken: accessToken });
    }
  };

  const handleDisconnect = () => {
    if (retellClientRef.current) {
        retellClientRef.current.stopCall();
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={() => handleCall()}
             // Disable button if actively connecting or finished, or if token is missing
             disabled={callStatus === CallStatus.CONNECTING || callStatus === CallStatus.FINISHED || !accessToken}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;