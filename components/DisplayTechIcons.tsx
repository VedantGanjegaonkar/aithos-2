// components/DisplayTechIcons.tsx
"use client"; // Add this for the error handling state

import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TechIcon {
  tech: string;
  url: string;
}

export default function DisplayTechIcons({ techIcons }: { techIcons: TechIcon[] }) {
  // Use a state to track which icons failed to load
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

  if (!techIcons || techIcons.length === 0) return null;
  const iconsToDisplay = techIcons.slice(0, 3);

  return (
    <div className="flex flex-row -space-x-2">
      {iconsToDisplay.map(({ tech, url }, index) => {
        const isFailed = failedIcons[`${tech}-${index}`];

        return (
          <div
            key={`${tech}-${index}`}
            className={cn(
              "relative group bg-white rounded-full p-1 flex items-center justify-center border border-dark-300 overflow-hidden h-7 w-7 transition-all hover:z-20",
            )}
          >
            {!isFailed && url ? (
              <Image
                src={url}
                alt={tech}
                width={18}
                height={18}
                className="object-contain"
                unoptimized
                onError={() => {
                  setFailedIcons((prev) => ({ ...prev, [`${tech}-${index}`]: true }));
                }}
              />
            ) : (
              <div className="bg-primary-200 w-full h-full flex items-center justify-center rounded-full">
                <span className="text-[8px] text-dark-300 font-bold uppercase">
                  {tech?.slice(0, 2)}
                </span>
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <span className="p-1.5 text-[10px] text-white bg-gray-900 shadow-xl rounded whitespace-nowrap">
                {tech}
              </span>
            </div>
          </div>
        );
      })}
      
      {techIcons.length > 3 && (
        <div className="h-7 w-7 rounded-full bg-dark-400 border border-white/10 flex items-center justify-center text-[9px] text-gray-400">
            +{techIcons.length - 3}
        </div>
      )}
    </div>
  );
}