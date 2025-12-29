"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mic, ShieldCheck, Loader2 } from "lucide-react";
import { consumeInterviewCredit } from "@/lib/actions/credit.action";
import { joinQueueOrStart } from "@/lib/actions/queue.action";
import { createInterviewSession } from "@/lib/actions/interview.action";

type FocusOption =
  | "personal & motivation"
  | "academics"
  | "work experience"
  | "current affairs & business awareness"
  | "mixed";

const colleges = [
  "IIM Ahmedabad",
  "IIM Bangalore",
  "IIM Calcutta",
  "XLRI Jamshedpur",
  "FMS Delhi",
  "NMIMS Mumbai",
  "Others"
];
const FOCUS_OPTIONS: { label: string; value: FocusOption }[] = [
  { label: "Personal & Motivation", value: "personal & motivation" },
  { label: "Academics", value: "academics" },
  { label: "Work Experience", value: "work experience" },
  { label: "Current Affairs & Business Awareness", value: "current affairs & business awareness" },
  { label: "Mixed (Balanced)", value: "mixed" },
];

const PROFILE_PRESETS = [
  "engineering background",
  "2 years consulting",
  "debating society",
  "NGO volunteering",
];

interface SetupFormProps {
  userId: string;
  username: string;
}

const SetupForm: React.FC<SetupFormProps> = ({ userId, username }) => {
  const router = useRouter();

  const [targetSchool, setTargetSchool] = useState("IIM Ahmedabad");
  const [program, setProgram] = useState("MBA");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([
    "engineering background",
    "NGO volunteering"
  ]);

  const [focus, setFocus] = useState<FocusOption>("mixed");
  const [amount, setAmount] = useState<string>("8");
  const [customHighlights, setCustomHighlights] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<"unknown" | "granted" | "denied">("unknown");

  const togglePreset = (preset: string) => {
    setSelectedPresets((prev) =>
      prev.includes(preset) ? prev.filter((p) => p !== preset) : [...prev, preset]
    );
  };

  const buildProfileHighlights = () => {
    const parts: string[] = [];
    if (selectedPresets.length > 0) parts.push(selectedPresets.join(", "));
    if (customHighlights.trim()) parts.push(customHighlights.trim());
    return parts.length === 0 ? "General profile" : parts.join(", ");
  };

  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicStatus("granted");
      return true;
    } catch (err) {
      setMicStatus("denied");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!userId) {
      toast.error("Please sign in to start an interview");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. MIC CHECK (First, because it's local)
      const hasMic = await requestMicAccess();
      if (!hasMic) {
        toast.error("Microphone access is mandatory to start the interview.");
        setIsSubmitting(false);
        return;
      }

      // 2. CONSTRUCT CONFIG DATA
      const interviewConfig = {
        userId,
        username,
        targetSchool,
        program,
        focus,
        profileHighlights: buildProfileHighlights(),
        amount: parseInt(amount),
      };

      // 3. QUEUE GATEKEEPER CHECK
      const queueStatus = await joinQueueOrStart(userId);

      if (queueStatus.action === "ENQUEUE") {
        // SAVE CONFIG TO LOCALSTORAGE FOR THE WAITING ROOM
        localStorage.setItem("pending_interview_config", JSON.stringify(interviewConfig));

        toast.info("AI Agents are busy. Spot reserved in queue.");
        router.push(`/interview/waiting-room?id=${queueStatus.queueId}`);
        return;
      }

      // 4. CREDIT CONSUMPTION (Only if starting now)
      const creditRes = await consumeInterviewCredit(userId);
      if (!creditRes.success) {
        const errorMsg = 'error' in creditRes ? creditRes.error : "Insufficient credits";
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // 5. GENERATE INTERVIEW SESSION
      // Using the shared action instead of a direct fetch for consistency
      const data = await createInterviewSession(interviewConfig);

      if (data.interviewId) {
        toast.success("Session authorized! Launching agent...");
        router.push(`/interview/${data.interviewId}`);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Target B-School
            </label>

            <select
              value={
                colleges.includes(targetSchool) ? targetSchool : "Others"
              }
              onChange={(e) => {
                if (e.target.value !== "Others") {
                  setTargetSchool(e.target.value);
                } else {
                  setTargetSchool(""); // reset for typing
                }
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
            >
              {colleges.map((college, index) => (
                <option key={index} value={college}>
                  {college}
                </option>
              ))}
            </select>

            {/* Input appears if value is not in predefined list */}
            {!colleges.includes(targetSchool) && (
              <input
                type="text"
                required
                value={targetSchool}
                onChange={(e) => setTargetSchool(e.target.value)}
                placeholder="Enter your B-School name"
                className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
              />
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Program</label>
            <input
              type="text"
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. MBA"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Interview Focus</label>
            <select
              required
              value={focus}
              onChange={(e) => setFocus(e.target.value as FocusOption)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
            >
              {FOCUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Profile Highlights</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {PROFILE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors border ${selectedPresets.includes(preset)
                    ? "bg-primary-200 text-dark-300 border-primary-200"
                    : "bg-neutral-800 text-gray-400 border-neutral-700 hover:border-gray-500"
                    }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <textarea
              value={customHighlights}
              onChange={(e) => setCustomHighlights(e.target.value)}
              placeholder="Add specific details from your CV or SOP..."
              className="w-full min-h-[115px] rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col items-center gap-4 border-t border-neutral-800 pt-5">
          <div className="flex items-center gap-2 mb-2">
            {micStatus === 'granted' ? (
              <ShieldCheck className="w-4 h-4 text-green-500" />
            ) : (
              <Mic className="w-4 h-4 text-gray-500" />
            )}
            <span className={`text-[11px] font-bold uppercase tracking-widest ${micStatus === 'granted' ? 'text-green-500' : 'text-gray-400'}`}>
              {micStatus === 'granted' ? "Mic Access Secured" : "Microphone Access Required"}
            </span>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-200 py-6 text-base font-bold text-dark-300 shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Orchestrating AI Agent...
              </>
            ) : "Start Interview (1 Credit)"}
          </Button>

          <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest">
            This session uses 1 credit from your balance.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SetupForm;