// app/(root)/layout.tsx

import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Footer from "@/components/Footer";

const Layout = async ({ children }: { children: ReactNode }) => {
  // 1. Fetch the raw user object from Firestore Admin
  const rawUser = await getCurrentUser();
  
  // 2. SERIALIZE: Convert the object to plain JSON to remove Firestore Classes
  // This turns Timestamps into strings so Next.js doesn't crash
  const user = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;
  
  const isAuthenticated = !!user;

  return (
    <>
      {/* 3. Pass the "Plain Object" user to the NavBar */}
      <NavBar isAuthenticated={isAuthenticated} user={user} />

      {/* pt-20 is essential for content clearance below the fixed Navbar */}
      <div className="root-layout pt-20">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default Layout;