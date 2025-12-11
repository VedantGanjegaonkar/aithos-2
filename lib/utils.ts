import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

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
