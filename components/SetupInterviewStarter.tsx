"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SetupForm from "@/components/SetupForm";
import { toast } from "sonner";

export default function SetupInterviewStarter({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="btn-primary max-sm:w-full"
        onClick={() => setOpen(true)}
      >
        Set up an Interview
      </Button>

      <SetupForm
        isOpen={open}
        onClose={() => setOpen(false)}
        userId={userId}
        onSuccess={() => toast.success("Interview created")}
      />
    </>
  );
}
