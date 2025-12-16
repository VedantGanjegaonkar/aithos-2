// components/DisplayTechIcons.tsx
// This component MUST NOT have 'use client' or be an async function.
import Image from "next/image";
import { cn } from "@/lib/utils"; 

interface TechIcon {
    tech: string;
    url: string;
}

interface DisplayTechIconsProps {
  // Receives the array of resolved icons from the server
  techIcons: TechIcon[]; 
}

// FIX: Ensure this is NOT an async function
const DisplayTechIcons = ({ techIcons }: DisplayTechIconsProps) => {
  
  // Defensive check (though the server should guarantee an array, this is safe)
  const iconsToDisplay = Array.isArray(techIcons) ? techIcons : [];

  return (
    <div className="flex flex-row">
      {iconsToDisplay.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          {/* Tooltip logic if needed */}
          <span className="tech-tooltip">{tech}</span> 

          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;