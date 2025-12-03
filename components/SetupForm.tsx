import React, { useState } from "react";

type FocusOption =
  | "personal & motivation"
  | "academics"
  | "work experience"
  | "current affairs & business awareness"
  | "mixed";

const FOCUS_OPTIONS: { label: string; value: FocusOption }[] = [
  {
    label: "Personal & Motivation",
    value: "personal & motivation",
  },
  {
    label: "Academics",
    value: "academics",
  },
  {
    label: "Work Experience",
    value: "work experience",
  },
  {
    label: "Current Affairs & Business Awareness",
    value: "current affairs & business awareness",
  },
  {
    label: "Mixed (Balanced)",
    value: "mixed",
  },
];

const PROFILE_PRESETS = [
  "engineering background",
  "2 years consulting",
  "debating society",
  "NGO volunteering",
];

const API_ENDPOINT = "https://aithos-mock.vercel.app/api/vapi/generate"; // <-- change this to match your route.ts path

interface SetupFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

const SetupForm: React.FC<SetupFormProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const [targetSchool, setTargetSchool] = useState("");
  const [program, setProgram] = useState("");
  const [focus, setFocus] = useState<FocusOption>("mixed");
  const [amount, setAmount] = useState<string>("8");

  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customHighlights, setCustomHighlights] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePreset = (preset: string) => {
    setSelectedPresets((prev) =>
      prev.includes(preset)
        ? prev.filter((p) => p !== preset)
        : [...prev, preset]
    );
  };

  const buildProfileHighlights = () => {
    const parts: string[] = [];
    if (selectedPresets.length > 0) {
      parts.push(selectedPresets.join(", "));
    }
    if (customHighlights.trim()) {
      parts.push(customHighlights.trim());
    }
    // fallback example if nothing entered
    if (parts.length === 0) {
      return "engineering background, 2 years consulting, debating society, NGO volunteering";
    }
    return parts.join(", ");
  };

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
        },
        body: JSON.stringify({
          targetSchool,
          program,
          focus,
          profileHighlights,
          amount,
          level: "mid",
          techstack: "python",
          userid: userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create interview");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg rounded-xl bg-black p-6 shadow-xl border border-gray-700">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Setup MBA/PGDM Interview Simulation
          </h2>

          <button
            type="button"
            className="text-gray-300 hover:text-white"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target School */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Target B-School <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              placeholder="IIM Ahmedabad, XLRI, FMS Delhi, ISB…"
              className="w-full rounded-md border border-gray-600 
                       bg-neutral-900 text-white px-3 py-2 text-sm 
                       placeholder:text-gray-400 outline-none 
                       focus:border-blue-500"
            />
          </div>

          {/* Program */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Program <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="MBA, PGDM, PGPX…"
              className="w-full rounded-md border border-gray-600 
                       bg-neutral-900 text-white px-3 py-2 text-sm 
                       placeholder:text-gray-400 outline-none 
                       focus:border-blue-500"
            />
          </div>

          {/* Focus */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Interview Focus <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={focus}
              onChange={(e) => setFocus(e.target.value as FocusOption)}
              className="w-full rounded-md border border-gray-600 
                       bg-neutral-900 text-white px-3 py-2 text-sm 
                       outline-none focus:border-blue-500"
            >
              {FOCUS_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Highlights */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Profile Highlights <span className="text-red-500">*</span>
            </label>

            <div className="mb-2 flex flex-wrap gap-2">
              {PROFILE_PRESETS.map((preset) => {
                const active = selectedPresets.includes(preset);

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePreset(preset)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      active
                        ? "border-blue-400 bg-blue-600 text-white"
                        : "border-gray-500 bg-neutral-800 text-gray-200"
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
              placeholder="Add more details... e.g. engineering background, consulting, debating, NGO volunteering"
              className="mt-1 w-full min-h-[70px] rounded-md border border-gray-600 
                       bg-neutral-900 text-white px-3 py-2 text-sm 
                       placeholder:text-gray-400 outline-none 
                       focus:border-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Number of Questions
            </label>
            <select
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-600 
                       bg-neutral-900 text-white px-3 py-2 text-sm 
                       outline-none focus:border-blue-500"
            >
              <option value="5" className="text-black">
                5
              </option>
              <option value="8" className="text-black">
                8 (recommended)
              </option>
              <option value="10" className="text-black">
                10
              </option>
              <option value="12" className="text-black">
                12
              </option>
            </select>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-600 px-4 py-2 text-sm 
                       text-white hover:bg-neutral-800"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium 
                       text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;
