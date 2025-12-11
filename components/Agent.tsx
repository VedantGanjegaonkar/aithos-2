"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RetellWebClient } from "retell-client-js-sdk"; 
import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";

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
    accessToken: string;
    callId: string; 
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  accessToken, 
  callId, 
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false); // New state for loading UI
  
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    if (!retellClientRef.current) {
      retellClientRef.current = new RetellWebClient(); 

      const onConnect = () => {
        console.log("Retell Call Started");
        setCallStatus(CallStatus.ACTIVE);
      };

      // FIX 1: Handler for call ending
      const onCallEnded = () => {
        console.log("Retell Call Ended (Event Triggered)");
        setCallStatus(CallStatus.FINISHED);
      };

      const onError = (error: Error) => {
        console.log("Retell Error:", error);
        setCallStatus(CallStatus.FINISHED);
      };

      const onMessage = (message: any) => { 
        if (message.event === "message" && message.message) {
            const { role, content } = message.message;
            if (role === 'agent' || role === 'user') {
                const newMessage: SavedMessage = { role: role === "agent" ? "assistant" : "user", content: content };
                setMessages((prev) => [...prev, newMessage]);
            }
        }
      };
      
      const onAudio = (event: any) => {
          if (event.event === "audio" && event.audio) {
            setIsSpeaking(event.audio.role === "agent");
          }
      }

      const client = retellClientRef.current;
      client.on("connect", onConnect);
      // FIX 2: Listen to both potential event names
      client.on("stop", onCallEnded);
      client.on("call_ended", onCallEnded);
      
      client.on("error", onError);
      client.on("message", onMessage);
      client.on("audio", onAudio);
    }
    
    return () => {
        if (retellClientRef.current) {
            const client = retellClientRef.current;
            client.off("connect");
            client.off("stop");
            client.off("call_ended");
            client.off("error");
            client.off("message");
            client.off("audio");
            if (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING) {
                 client.stopCall();
            }
        }
    };
  }, [callStatus]);

  // Poll server-side Retell status as a fallback in case SDK events are missed
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const pollInterval = 3000;

    async function checkCallStatus() {
      try {
        const res = await fetch(`/api/retell/status?callId=${encodeURIComponent(callId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.call_status === 'ended' && callStatus !== CallStatus.FINISHED) {
          console.log('[CLIENT] Detected call ended via server poll');
          setCallStatus(CallStatus.FINISHED);
        }
      } catch (err) {
        console.warn('[CLIENT] Poll error', err);
      }
    }

    if (callStatus === CallStatus.ACTIVE) {
      // start polling
      interval = setInterval(checkCallStatus, pollInterval);
      // do an immediate check
      checkCallStatus();
    }

    return () => {
      if (interval) clearInterval(interval as any);
    };
  }, [callStatus, callId]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Consolidated Feedback Generation Function
  const generateFeedback = async () => {
    if (isGenerating) return; // Prevent double submission
    setIsGenerating(true);
    
    console.log("[CLIENT] Requesting server to fetch transcript and generate feedback...");

    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      callId: callId, 
      feedbackId,
    });

    console.log(`[CLIENT] Server Action returned: Success=${success}, ID=${id}`);

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.error("[CLIENT] Error saving feedback. Redirecting to home."); 
      router.push("/");
    }
  };

  // Auto-trigger when status changes to FINISHED
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      generateFeedback();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]); 

  const handleCall = () => {
    if (retellClientRef.current && callStatus === CallStatus.INACTIVE) {
        // Defensive: log the access token and attempt to start the call with error handling
        console.log('[CLIENT] Starting call with accessToken:', accessToken?.slice ? accessToken.slice(0, 20) + '...' : accessToken);
        setCallStatus(CallStatus.CONNECTING);
        try {
          const startResult = retellClientRef.current.startCall({ accessToken: accessToken });
          // startCall may be sync or return a promise; handle both
          if (startResult && typeof (startResult as any).then === 'function') {
            (startResult as Promise<any>)
              .then((res) => console.log('[CLIENT] startCall resolved', res))
              .catch((err) => {
                console.error('[CLIENT] startCall error (async):', err);
                setCallStatus(CallStatus.INACTIVE);
              });
          }
        } catch (err) {
          console.error('[CLIENT] startCall exception:', err);
          setCallStatus(CallStatus.INACTIVE);
        }
    }
  };

  const handleDisconnect = () => {
    if (retellClientRef.current) {
        retellClientRef.current.stopCall();
    }
  };

  // End call and trigger server-side feedback generation (redirect handled by generateFeedback)
  const endCallAndGenerate = async () => {
    // Confirmation before ending
    if (typeof window !== "undefined") {
      const ok = window.confirm("Are you sure you want to end the call and generate feedback?");
      if (!ok) return;
    }

    if (retellClientRef.current) {
      try {
        retellClientRef.current.stopCall();
      } catch (err) {
        console.warn("Error stopping call:", err);
      }
    }

    // mark call as finished locally and trigger feedback creation
    setCallStatus(CallStatus.FINISHED);
    // generateFeedback flips `isGenerating` which will show the buffer overlay
    await generateFeedback();
  };

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-lg p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
            <svg className="w-12 h-12 text-primary-300 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Please wait — feedback is being generated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">This may take a few seconds. You will be redirected when ready.</p>
          </div>
        </div>
      )}
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="profile" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="profile" width={539} height={539} className="rounded-full object-cover size-[120px]" />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p key={lastMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus === CallStatus.INACTIVE && (
           <button className="relative btn-call" onClick={handleCall} disabled={!accessToken}>
             <span className="relative">Call</span>
           </button>
        )}

          {callStatus === CallStatus.CONNECTING && (
            <button className="btn-disconnect" onClick={endCallAndGenerate}>End</button>
          )}

          {callStatus === CallStatus.ACTIVE && (
            <button className="btn-disconnect" onClick={endCallAndGenerate}>End</button>
          )}

        {/* FIX 3: Explicit Loading/Retry State */}
        {callStatus === CallStatus.FINISHED && (
           <button className="relative btn-call" disabled={isGenerating} onClick={generateFeedback}>
             {isGenerating ? "Analyzing..." : "Generate Feedback"}
           </button>
        )}
      </div>
    </>
  );
};

export default Agent;