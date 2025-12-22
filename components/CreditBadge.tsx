"use client";

import { useEffect, useState } from "react";
import { Coins, PlusCircle } from "lucide-react";
import Link from "next/link";
import { db } from "@/firebase/client"; // 1. Import your client db
import { doc, onSnapshot } from "firebase/firestore"; // 2. Import Firestore listeners

export function CreditBadge({ userId }: { userId: string }) {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    // 3. Create a listener to the specific user document
    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          // Updates state instantly when the DB changes
          setCredits(docSnap.data().credits || 0);
        } else {
          setCredits(0);
        }
      },
      (error) => {
        console.error("Credit listener failed:", error);
        setCredits(0);
      }
    );

    // 4. Clean up listener when component unmounts
    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="flex items-center gap-3 bg-neutral-800/50 border border-neutral-700 px-4 py-1.5 rounded-full hover:border-primary-200/40 transition-all group">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-primary-200" />
        <span className="text-sm font-bold text-white">
          {credits !== null ? credits : "..."} Credits
        </span>
      </div>
      
      <Link 
        href="/pricing" 
        className="flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <PlusCircle className="w-4 h-4 text-primary-200 cursor-pointer group-hover:text-white" />
      </Link>
    </div>
  );
}