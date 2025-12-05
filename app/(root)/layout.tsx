import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import NavBar from "@/components/NavBar"; // <-- IMPORT YOUR FULL NAVBAR HERE

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  // 1. Authentication Check (Keep this logic)
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    // Outer Wrapper: Use the site-dark-gradient class here (or ensure it's on the <body> tag)
    // We'll assume the body handles the full site gradient and min-h-screen
    <>
      {/* 2. NAVIGATION BAR: Fixed at the top (as defined within NavBar.jsx) */}
      <NavBar />

      {/* 3. MAIN CONTENT WRAPPER */}
      {/* - The 'root-layout' class is kept for max-width/centering (as seen in your globals.css).
         - The 'pt-20' class is CRUCIAL: It adds top padding equal to the NavBar's height 
           to ensure the main content (your pages) is not hidden underneath the fixed navbar. 
      */}
      <div className="root-layout pt-20">
        {children}
      </div>
    </>
  );
};

export default Layout;