// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInstitutionLogoUrl = (schoolName: string) => {
  if (!schoolName) return `https://ui-avatars.com/api/?name=User&background=A8A0FF&color=fff`;
  const name = schoolName.toLowerCase();
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";
  const schoolDomains: Record<string, string> = {
    "iim ahmedabad": "iima.ac.in", "iim a": "iima.ac.in", "iim bangalore": "iimb.ac.in", 
    "isb": "isb.edu", "xlri": "xlri.ac.in", "wharton": "wharton.upenn.edu"
  };
  const matchedKey = Object.keys(schoolDomains).find(key => name.includes(key));
  if (matchedKey) return `https://img.logo.dev/${schoolDomains[matchedKey]}?token=${token}`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolName)}&background=A8A0FF&color=fff&size=512&bold=true`;
};

/**
 * Enhanced Tech & Subject Icon Fetcher
 */
export async function getTechLogos(techstack: string[] | string | undefined | null) {
  if (!techstack) return [];
  
  let stack: string[] = Array.isArray(techstack) 
    ? techstack 
    : String(techstack).split(',').map(s => s.trim()).filter(Boolean);

  // Mapping common MBA/Tech terms to SimpleIcons slugs
  const iconSlugMap: Record<string, string> = {
    "excel": "microsoftexcel",
    "powerpoint": "microsoftpowerpoint",
    "ppt": "microsoftpowerpoint",
    "finance": "googlebalance",
    "marketing": "googleads",
    "strategy": "target",
    "data": "databricks",
    "python": "python",
    "sql": "postgresql",
    "react": "react",
    "javascript": "javascript",
    "js": "javascript",
    "node": "nodedotjs",
    "mixed": "shuffle"
  };

  return stack.map(item => {
    const lowerItem = item.toLowerCase();
    const slug = iconSlugMap[lowerItem] || lowerItem.replace(/\s+/g, '');
    
    // We use the colored version of SimpleIcons for better visibility
    return {
      tech: item,
      url: `https://cdn.simpleicons.org/${slug}`
    };
  });
}