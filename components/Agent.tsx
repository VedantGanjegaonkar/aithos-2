// components/Agent.tsx
"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";
import { cn } from "@/lib/utils";
import { createFeedback, saveInterviewTranscript } from "@/lib/actions/general.action";

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
    onStatusChange: (status: CallStatus) => void; 
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  accessToken, 
  callId, 
  onStatusChange, 
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false); 
  
  const roomRef = useRef<Room | null>(null);
  
  // FIX: Create a ref to skip the initial mount render for the status communication
  const isInitialMount = useRef(true); 

  // EFFECT 1: Communicate status changes to the parent (for the timer)
  useEffect(() => {
      // FIX: Skip running the effect on the very first mount cycle
      if (isInitialMount.current) {
          isInitialMount.current = false;
          // Optionally call onStatusChange with the initial state to sync immediately
          onStatusChange(callStatus); 
          return;
      }
      
      // Now, this only runs on subsequent updates to callStatus
      onStatusChange(callStatus); 

  }, [callStatus, onStatusChange]);


  // EFFECT 2: LiveKit setup and event handling
  useEffect(() => {
    if (!roomRef.current) {
      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        console.log("LiveKit Room Connected");
        setCallStatus(CallStatus.ACTIVE);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("LiveKit Room Disconnected");
        setCallStatus(CallStatus.FINISHED);
      });

      room.on(RoomEvent.TrackSubscribed, (_track, _publication, participant) => {
        if (!participant.isLocal) setIsSpeaking(true);
      });

      room.on(RoomEvent.TrackUnsubscribed, (_track, _publication, participant) => {
        if (!participant.isLocal) setIsSpeaking(false);
      });

      room.on(RoomEvent.DataReceived, (payload) => {
        try {
          const text = new TextDecoder().decode(payload);
          const parsed = JSON.parse(text);
          if ((parsed.role === "assistant" || parsed.role === "user") && parsed.content) {
            setMessages((prev) => [...prev, { role: parsed.role, content: parsed.content }]);
          }
        } catch {
          // ignore non-json data packets
        }
      });
    }
    
    return () => {
        if (roomRef.current && (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING)) {
            roomRef.current.disconnect();
        }
    };
  }, [callStatus]);

  // EFFECT 4: Update last message for transcript display
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // --- Core Functions ---

  const generateFeedback = async () => {
    if (isGenerating) return; 
    setIsGenerating(true);
    
    console.log("[CLIENT] Requesting server to fetch transcript and generate feedback...");
    if (interviewId) {
      await saveInterviewTranscript({ interviewId, transcript: messages });
    }

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

  // EFFECT 5: Trigger feedback generation when call finishes
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      generateFeedback();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]); 

  const handleCall = () => {
    // Robust check for access token before proceeding
    if (!accessToken || accessToken.length === 0) {
      console.error("[CLIENT] Cannot start call: accessToken is missing or empty.");
      alert("Error: Missing access token. Cannot start interview. Check server logs or verify token generation.");
      return;
    }

    if (roomRef.current && callStatus === CallStatus.INACTIVE) {
        console.log('[CLIENT] Attempting to start call...');
        setCallStatus(CallStatus.CONNECTING);
        try {
          const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
          if (!livekitUrl) throw new Error("Missing NEXT_PUBLIC_LIVEKIT_URL");

          roomRef.current.connect(livekitUrl, accessToken)
            .then(async () => {
              const localAudioTrack = await createLocalAudioTrack();
              await roomRef.current?.localParticipant.publishTrack(localAudioTrack);
              console.log('[CLIENT] LiveKit connection established');
            })
            .catch((err) => {
              console.error('[CLIENT] LiveKit connect error:', err);
              setCallStatus(CallStatus.INACTIVE);
            });
        } catch (err) {
          console.error('[CLIENT] LiveKit exception:', err);
          setCallStatus(CallStatus.INACTIVE);
        }
    }
  };

  const endCallAndGenerate = async () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Are you sure you want to end the call and generate feedback?");
      if (!ok) return;
    }

    if (roomRef.current) {
      try {
        roomRef.current.disconnect();
      } catch (err) {
        console.warn("Error disconnecting room:", err);
      }
    }

    // Setting status to FINISHED will trigger the useEffect to call generateFeedback
    setCallStatus(CallStatus.FINISHED);
  };

  return (
    <>
      {/* Premium Loading Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card/95 rounded-lg p-8 flex flex-col items-center gap-4 max-w-sm mx-4 border border-border shadow-2xl">
            <svg className="w-12 h-12 text-primary-200 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <h3 className="text-lg font-semibold text-foreground">Please wait — feedback is being generated</h3>
            <p className="text-sm text-light-400">This may take a few seconds. You will be redirected when ready.</p>
          </div>
        </div>
      )}
      
      {/* Call View: Interviewer and User Cards */}
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="profile" width={65} height={54} className="object-cover" />
            {/* animate-speak triggers the premium pulse-glow effect */}
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
      
      {/* Live Transcript (Premium Floating Style) */}
      {messages.length > 0 && (
        <div className="transcript-border mt-8">
          <div className="transcript">
            <p key={lastMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons (Start/End/Feedback) */}
      <div className="w-full flex justify-center mt-8">
        
        {/* Start Call Button (INACTIVE) */}
        {callStatus === CallStatus.INACTIVE && (
           <button 
             className="relative btn-call call-button-gradient shadow-lg shadow-primary-200/30" 
             onClick={handleCall} 
             disabled={!accessToken || accessToken.length === 0}
           >
             <span className="relative font-bold">Start Call</span>
           </button>
        )}

        {/* End Call Button (CONNECTING or ACTIVE) */}
        {(callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE) && (
          <button 
            className="btn-disconnect" 
            onClick={endCallAndGenerate}
          >
            End Call
          </button>
        )}

        {/* Generate Feedback Button (FINISHED) */}
        {callStatus === CallStatus.FINISHED && (
           <button 
             className="relative btn-call call-button-gradient shadow-lg shadow-primary-200/30" 
             disabled={isGenerating} 
             onClick={generateFeedback}
           >
             {isGenerating ? "Analyzing..." : "Generate Feedback"}
           </button>
        )}
      </div>
    </>
  );
};

// EXPORT: Must be exported so parent components can use it
export { CallStatus }; 
export default Agent;
