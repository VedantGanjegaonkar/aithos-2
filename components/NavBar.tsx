

"use client";

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"; 
import { signOut } from "@/lib/actions/auth.action"; 

// Assume User type is defined in types/index.d.ts
interface User {
  name: string;
  email: string;
  id: string;
  profileURL?: string; 
}

// --- PROP INTERFACE ---
interface NavBarProps {
  isAuthenticated: boolean;
  user: User | null; // Pass the user object
}

// Define your key navigation items
const NAV_LINKS = [
  { name: "Features", href: "/" },
  { name: "Pricing", href: "/" },
  { name: "About", href: "/" },
];

// Client component wrapper for Log Out functionality
const SignOutButton = () => {
    const router = useRouter();
    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in'); 
    };

    return (
        <Button className="btn-secondary" onClick={handleSignOut}>
            Log Out
        </Button>
    );
};

const NavBar = ({ isAuthenticated, user }: NavBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Use a placeholder image path if user.profileURL is undefined
  const userAvatarSrc = user?.profileURL || "/user-avatar.png"; 

  return (
    <nav className="
        fixed top-0 left-0 w-full z-50 
        py-4 px-16 max-sm:px-4 
        bg-gradient-to-r from-dark-100 to-dark-800 
        shadow-xl border-b border-gray-700/50 
    ">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        
        {/* --- 1. LOGO / BRAND --- */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Aithos Logo" width={32} height={32} />
          <span className="text-xl font-bold text-primary-200">Aithos</span> 
        </Link>

        {/* --- 2. DESKTOP LINKS --- */}
        <div className="hidden md:flex items-center space-x-8"> 
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-gray-300 hover:text-primary-200 transition-colors text-sm font-medium"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* --- 3. DESKTOP CTAS (Conditional) --- */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            // AUTHENTICATED STATE: Avatar + Profile Link + Log Out
            <>
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                {/* User Avatar */}
                <Image
                  src={userAvatarSrc}
                  alt={user?.name || "User Avatar"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover size-8 border-2 border-primary-200/50"
                />
                <span className="text-sm font-semibold hidden lg:inline">{user?.name || "Profile"}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            // UNAUTHENTICATED STATE: Log In + Sign Up Buttons
            <>
              <Link href="/sign-in" className="text-gray-300 hover:text-white transition-colors text-sm">Log In</Link>
              <Button className="btn-primary hidden md:inline-flex"> 
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* --- 4. MOBILE HAMBURGER ICON --- */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
          </svg>
        </button>
      </div>

      {/* --- 5. MOBILE MENU (Conditional Rendering) --- */}
      <div className={`
        md:hidden overflow-hidden transition-max-height duration-500 ease-in-out
        ${isOpen ? 'max-h-96' : 'max-h-0'} 
        mt-4 border-t border-gray-700/50
      `}>
        <div className="flex flex-col space-y-3 pt-3">
          
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)} 
              className="text-gray-300 hover:text-primary-200 transition-colors block py-2 text-base font-medium"
            >
              {link.name}
            </Link>
          ))}
          
          {isAuthenticated ? (
            // Authenticated Mobile Links
            <>
              <Link href="/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors block py-2 text-base font-medium">
                <div className="flex items-center space-x-2">
                  <Image
                    src={userAvatarSrc}
                    alt={user?.name || "User Avatar"}
                    width={24}
                    height={24}
                    className="rounded-full object-cover size-6 border-2 border-primary-200/50"
                  />
                  <span>{user?.name || "Profile"}</span>
                </div>
              </Link>
              <SignOutButton />
            </>
          ) : (
            // Unauthenticated Mobile Links
            <>
              <Link href="/sign-in" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors block py-2 text-base font-medium border-t border-gray-700/50">Log In</Link>
              <Button className="btn-primary w-full mt-2"> 
                <Link href="/sign-up" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;