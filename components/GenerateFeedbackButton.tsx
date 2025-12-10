"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createFeedback } from "@/lib/actions/general.action";

interface Props {
  interviewId: string;
  userId: string;
  callId: string;
}

const GenerateFeedbackButton = ({ interviewId, userId, callId }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      console.log("Manually triggering feedback generation...");
      
      // Call the Server Action with the stored Call ID
      const res = await createFeedback({
        interviewId,
        userId,
        callId,
      });

      if (res.success) {
        console.log("Success! Refreshing page...");
        router.refresh(); // Reload page to show new data
      } else {
        alert("Analysis failed. Check server logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={loading} 
      className="btn-primary w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
    >
      {loading ? "Analyzing Transcript..." : "Generate Feedback Now"}
    </Button>
  );
};

export default GenerateFeedbackButton;