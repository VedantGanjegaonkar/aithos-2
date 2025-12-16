// lib/utils.ts

import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Tech Logo Constants and Helpers ---
const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  // Ensure we check if the key exists in mappings before returning
  return mappings[key as keyof typeof mappings] || key;
};

const checkIconExists = async (url: string) => {
  try {
    // Using HEAD is efficient as it only checks metadata, not the full file.
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

interface TechIcon {
    tech: string;
    url: string;
}

/**
 * Fetches the logo URLs for an array of technology names, checking if the icon
 * file exists via an asynchronous network call.
 * * FIX: Added defensive check for null/undefined techArray input.
 */
export const getTechLogos = async (techArray: string[] | undefined | null): Promise<TechIcon[]> => {
    
  // FIX: Guard against techArray being null or undefined.
  const safeTechArray = Array.isArray(techArray) ? techArray : [];

  // If the array is empty, return immediately to avoid unnecessary work.
  if (safeTechArray.length === 0) {
      return [];
  }

  const logoURLs = safeTechArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  // Perform the asynchronous check for icon existence in parallel
  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      // If checkIconExists is true, use the URL; otherwise, use the local fallback
      url: (await checkIconExists(url)) ? url : "/tech.svg", 
    }))
  );

  return results;
};

// --- Institution Image Helpers ---

export const getInstitutionImageUrl = (institutionName: string) => {
  // 1. Define the specific image path for IIM Ahmedabad
  const IIM_AHMEDABAD_PATH = "/covers/IIM_Ahemdabad.png";
  const XLRI_J_PATH = "/covers/XLRI_J.jpeg" 
  
  // 2. Define a default image path for all other cases
  const DEFAULT_COVER_PATH = "/covers/default-campus-view.png"; 


  if (institutionName === "IIM Ahemdabad") {
    return IIM_AHMEDABAD_PATH;
  }
  else if(institutionName === "XLRI J")
  {
    return XLRI_J_PATH;
  }

  
  return DEFAULT_COVER_PATH;
}; 