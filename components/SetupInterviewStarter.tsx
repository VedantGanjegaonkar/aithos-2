// ved-pandya/test_aithos/test_aithos-7f98104aa6f9ba6e2d00a371a5d6ac4e96919a19/components/SetupInterviewStarter.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SetupForm from "@/components/SetupForm";
import { toast } from "sonner";

// Update component signature: userId is passed as a string (can be empty string if logged out)
export default function SetupInterviewStarter({ userId }: { userId: string }) { 
  const [open, setOpen] = useState(false);

  const handleCtaClick = () => {
    // Check if userId is a non-empty string (User is logged in)
    if (userId) { 
      setOpen(true);
    } else {
      // User is logged out, prompt them to log in/sign up (buttons in NavBar)
      toast.info("Please log in or create an account to set up an interview.", {
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Button
        className="btn-primary max-sm:w-full"
        onClick={handleCtaClick}
      >
        Set up an Interview
      </Button>

      {/* Only render the form if the user is logged in (userId is non-empty) */}
      {userId && (
        <SetupForm
          isOpen={open}
          onClose={() => setOpen(false)}
          userId={userId}
          onSuccess={() => toast.success("Interview created")}
        />
      )}
    </>
  );
}