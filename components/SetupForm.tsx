"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FocusOption =
  | "personal & motivation"
  | "academics"
  | "work experience"
  | "current affairs & business awareness"
  | "mixed";

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

const API_ENDPOINT = "/api/vapi/generate";

interface SetupFormProps {
  userId: string;
  username: string;
}

const SetupForm: React.FC<SetupFormProps> = ({ userId, username }) => {
  const router = useRouter();

  // --- PRE-FILLED DEFAULTS ---
  const [targetSchool, setTargetSchool] = useState("IIM A");
  const [program, setProgram] = useState("MBA");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([
    "engineering background",
    "NGO volunteering"
  ]);
  // ---------------------------

  const [focus, setFocus] = useState<FocusOption>("mixed");
  const [amount, setAmount] = useState<string>("8");
  const [customHighlights, setCustomHighlights] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
        toast.error("Please sign in to start an interview");
        return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: userId,
          username: username,
          targetSchool,
          program,
          focus,
          profileHighlights: buildProfileHighlights(),
          amount: parseInt(amount),
          role: targetSchool,
          type: program,
          level: "MBA",
          techstack: "General",
        }),
      });

      if (!res.ok) throw new Error("Failed to create interview");
      const data = await res.json();
      
      toast.success("Interview created! Redirecting...");
      if (data.interviewId) {
          router.push(`/interview/${data.interviewId}`);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Core Details */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Target B-School</label>
            <input
              type="text" required value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              placeholder="e.g. IIM Ahmedabad"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Program</label>
            <input
              type="text" required value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. MBA"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Focus</label>
            <select
              required value={focus}
              onChange={(e) => setFocus(e.target.value as FocusOption)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all"
            >
              {FOCUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Profile Highlights */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Profile Highlights</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {PROFILE_PRESETS.map((preset) => (
                <button
                  key={preset} type="button" onClick={() => togglePreset(preset)}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors border ${
                    selectedPresets.includes(preset)
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
              placeholder="Add specific details..."
              className="w-full min-h-[115px] rounded-lg border border-neutral-700 bg-neutral-800/50 text-white px-4 py-2.5 text-sm focus:border-primary-200 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Full Width Footer */}
        <div className="md:col-span-2 flex flex-col gap-4 border-t border-neutral-800 pt-5">
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-200 py-3 text-sm font-bold text-dark-300 shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Setting up session..." : "Start Interview Simulation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetupForm;