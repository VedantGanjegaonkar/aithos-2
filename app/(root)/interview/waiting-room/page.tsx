"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/firebase/client";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Mic, MicOff, Users } from "lucide-react";
import { createInterviewSession } from "@/lib/actions/interview.action";
import { toast } from "sonner";

function WaitingRoomContent() {
    const searchParams = useSearchParams();
    const queueId = searchParams.get("id");
    const router = useRouter();

    const [status, setStatus] = useState<string>("waiting");
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes default
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isLaunching, setIsLaunching] = useState(false);
    const [micTested, setMicTested] = useState(false);

    // --- 1. REF-BASED STATE TRACKING (For Cleanup) ---
    const stateRef = useRef({ status, queueId });
    useEffect(() => {
        stateRef.current = { status, queueId };
    }, [status, queueId]);

    // --- 2. TAB CLOSE CLEANUP (The "Nuclear" Option) ---
    useEffect(() => {
        const handleLeave = () => {
            const { queueId: latestId } = stateRef.current;
            if (latestId) {
                const params = new URLSearchParams();
                params.append("queueId", latestId);
                // Use keepalive fetch as primary, beacon as secondary
                fetch(`${window.location.origin}/api/queue/leave`, {
                    method: 'POST',
                    body: params,
                    keepalive: true,
                    mode: 'no-cors'
                });
                navigator.sendBeacon(`${window.location.origin}/api/queue/leave`, params);
            }
        };

        window.addEventListener("beforeunload", handleLeave);
        window.addEventListener("unload", handleLeave);
        return () => {
            window.removeEventListener("beforeunload", handleLeave);
            window.removeEventListener("unload", handleLeave);
        };
    }, []);

    // --- 3. LISTEN FOR STATUS & POSITION ---
    useEffect(() => {
        if (!queueId) return;

        // Listener A: Status & Expiry Time
        const unsubDoc = onSnapshot(doc(db, "interview_queue", queueId), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setStatus(data.status);
                // Capture the server-side expiry timestamp
                if (data.timerEndsAt) {
                    setEndTime(data.timerEndsAt.seconds * 1000);
                }
            } else {
                setStatus("expired");
            }
        }, (err) => {
            if (err.code !== "permission-denied") console.error("Doc Error:", err);
        });

        // Listener B: Queue Position
        let unsubQueue: () => void;
        if (status === "waiting") {
            const q = query(
                collection(db, "interview_queue"),
                where("status", "==", "waiting"),
                orderBy("joinedAt", "asc"),
                limit(50)
            );
            unsubQueue = onSnapshot(q, (snapshot) => {
                const position = snapshot.docs.findIndex(doc => doc.id === queueId);
                setQueuePosition(position !== -1 ? position + 1 : null);
            }, (err) => {
                if (err.code !== "permission-denied") console.error("Queue Position Error:", err);
            });
        }

        return () => {
            unsubDoc();
            if (unsubQueue) unsubQueue();
        };
    }, [queueId, status]);

    // --- 4. LIVE COUNTDOWN TIMER ---
    useEffect(() => {
        if (status !== "reserved" || !endTime) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                setStatus("expired");
            } else {
                setTimeLeft(Math.floor(distance / 1000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [status, endTime]);

    // --- 5. ACTIONS ---
    const testMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setMicTested(true);
            toast.success("Microphone ready!");
        } catch (err) {
            toast.error("Microphone check failed.");
        }
    };

    const handleStartNow = async () => {
        if (!micTested) return toast.error("Please test your mic first");
        setIsLaunching(true);
        try {
            const savedConfig = localStorage.getItem("pending_interview_config");
            if (!savedConfig) throw new Error("No config found");
            const data = await createInterviewSession({ ...JSON.parse(savedConfig), queueId });
            localStorage.removeItem("pending_interview_config");
            router.push(`/interview/${data.interviewId}`);
        } catch (error) {
            console.error("Launch Error:", error);
            setIsLaunching(false);
            toast.error("Failed to launch interview.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 mt-16">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-[40px] p-10 shadow-2xl text-center relative overflow-hidden">

                {status === "waiting" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="relative w-20 h-20 mx-auto">
                            <Loader2 className="w-20 h-20 text-primary-200 animate-spin absolute top-0" />
                            <div className="w-20 h-20 rounded-full border-4 border-white/5" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">In Queue</h1>
                            <div className="flex items-center justify-center gap-2 mt-2 text-primary-200">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-bold uppercase tracking-widest">
                                    {queuePosition ? `Position: #${queuePosition}` : "Checking position..."}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Our AI agents are currently at capacity. Your spot will open automatically as soon as an interview ends.
                        </p>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Estimated Wait</p>
                            <p className="text-3xl font-bold text-primary-200">
                                {queuePosition ? `~ ${queuePosition * 5}-${queuePosition * 8} Mins` : "Calculating..."}
                            </p>
                        </div>
                    </div>
                )}

                {status === "reserved" && (
                    <div className="space-y-6 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white italic">You're Up!</h1>

                        <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${micTested ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`} onClick={testMic}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {micTested ? <Mic className="text-green-500" /> : <MicOff className="text-gray-500" />}
                                    <span className={`text-sm font-bold uppercase ${micTested ? 'text-green-500' : 'text-gray-400'}`}>
                                        {micTested ? "Microphone Ready" : "Audio Check Required"}
                                    </span>
                                </div>
                                {!micTested && <Button size="sm" className="h-7 text-[10px] font-bold">TEST</Button>}
                            </div>
                        </div>

                        <div className="text-4xl font-mono text-primary-200 bg-white/5 py-4 rounded-2xl border border-white/5">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <Button
                            disabled={isLaunching || !micTested}
                            className={`w-full py-8 rounded-2xl text-xl font-black transition-all ${micTested ? 'bg-primary-200 text-dark-300' : 'bg-neutral-800 text-gray-500 cursor-not-allowed'}`}
                            onClick={handleStartNow}
                        >
                            {isLaunching ? <Loader2 className="animate-spin" /> : "Start Interview Now"}
                        </Button>
                    </div>
                )}

                {status === "expired" && (
                    <div className="space-y-6">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-white font-bold">Session Expired</h1>
                        <p className="text-gray-400 text-sm italic">You didn't claim your spot in time.</p>
                        <Button className="w-full bg-white/10" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function WaitingRoom() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
            <WaitingRoomContent />
        </Suspense>
    );
}