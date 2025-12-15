import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 Import this

// --- Types & Constants ---
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
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  onSuccess?: (data: any) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  onSuccess,
}) => {
  const router = useRouter(); // 👈 Initialize Router

  // --- Form State ---
  const [targetSchool, setTargetSchool] = useState("");
  const [program, setProgram] = useState("");
  const [focus, setFocus] = useState<FocusOption>("mixed");
  const [amount, setAmount] = useState<string>("8");

  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customHighlights, setCustomHighlights] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- Helpers ---
  const togglePreset = (preset: string) => {
    setSelectedPresets((prev) =>
      prev.includes(preset)
        ? prev.filter((p) => p !== preset)
        : [...prev, preset]
    );
  };

  const buildProfileHighlights = () => {
    const parts: string[] = [];
    if (selectedPresets.length > 0) parts.push(selectedPresets.join(", "));
    if (customHighlights.trim()) parts.push(customHighlights.trim());
    return parts.length === 0 ? "General profile" : parts.join(", ");
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const profileHighlights = buildProfileHighlights();

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        body: JSON.stringify({
          userid: userId,
          username: username,
          targetSchool,
          program,
          focus,
          profileHighlights,
          amount: parseInt(amount),
          
          // Compat fields
          role: targetSchool,
          type: program,
          level: "MBA",
          techstack: "General",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create interview");
      }

      const data = await res.json();

      // 1. Handle Success Callback (Optional)
      if (onSuccess) onSuccess(data);

      // 2. Redirect to the Interview Page
      // Assuming your page structure is /interview/[interviewId]
      if (data.interviewId) {
          router.push(`/interview/${data.interviewId}`); // 👈 Redirect happens here
      } else {
          throw new Error("No Interview ID returned from server");
      }

      // 3. Close Modal (Cleanup)
      onClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-neutral-900 p-6 shadow-2xl border border-neutral-800">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Setup Interview Simulation
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Target School */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Target B-School <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              placeholder="e.g. IIM Ahmedabad, ISB, Wharton..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white px-4 py-2.5 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Program */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Program <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. MBA, PGDM-BM..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white px-4 py-2.5 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Focus */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Interview Focus <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={focus}
              onChange={(e) => setFocus(e.target.value as FocusOption)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              {FOCUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-black">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Highlights */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Profile Highlights <span className="text-red-500">*</span>
            </label>
            
            <div className="mb-3 flex flex-wrap gap-2">
              {PROFILE_PRESETS.map((preset) => {
                const active = selectedPresets.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePreset(preset)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-blue-600 text-white border border-blue-500"
                        : "bg-neutral-800 text-gray-400 border border-neutral-700 hover:border-gray-500"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            <textarea
              value={customHighlights}
              onChange={(e) => setCustomHighlights(e.target.value)}
              placeholder="Add specific details..."
              className="w-full min-h-[80px] rounded-lg border border-neutral-700 bg-neutral-800 text-white px-4 py-2.5 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-neutral-800 pt-5">
            <button
              type="button"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Setting up...
                </span>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;