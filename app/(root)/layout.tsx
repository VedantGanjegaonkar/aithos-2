// ved-pandya/test_aithos/test_aithos-7f98104aa6f9ba6e2d00a371a5d6ac4e96919a19/app/(root)/layout.tsx

import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Footer from "@/components/Footer";

const Layout = async ({ children }: { children: ReactNode }) => {
  // Fetches user, but does NOT redirect if null (public homepage)
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return (
    <>
      {/* Pass the isAuthenticated status and the user object */}
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