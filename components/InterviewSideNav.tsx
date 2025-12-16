// components/InterviewSideNav.tsx
"use client";

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutDashboard } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { signOut } from "@/lib/actions/auth.action"; 

// Assume User type structure based on context from NavBar.tsx
interface UserType {
  name: string;
  email: string;
  id: string;
  profileURL?: string; 
}

interface InterviewSideNavProps {
  user: UserType; // User must be passed for account details
}

const NAV_LINKS = [
  { name: "Dashboard", href: "/interview", icon: LayoutDashboard },
];

const SignOutButton = () => {
    const router = useRouter();
    const handleSignOut = async () => {
        // Uses the existing action for logging out
        const result = await signOut();
        // Redirect to sign-in page after logout
        if (result?.success !== false) { 
             router.push('/sign-in'); 
        }
    };

    return (
        <button 
            onClick={handleSignOut}
            // Using tailwind classes defined by your theme
            className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-dark-200/50 transition-colors w-full"
        >
            <LogOut className="size-5" />
            <span className="font-medium">Log Out</span>
        </button>
    );
};


const InterviewSideNav = ({ user }: InterviewSideNavProps) => {
  const userAvatarSrc = user?.profileURL || "/user-avatar.png"; 

  return (
    <div className="
      flex flex-col justify-between 
      bg-dark-300 border-r border-border
      w-[250px] min-h-screen p-6 
      max-lg:hidden sticky top-0
    ">
      {/* Top Section: Logo and Navigation */}
      <div>
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mb-10">
          <Image src="/logo.svg" alt="Aithos Logo" width={32} height={32} />
          <span className="text-xl font-bold text-primary-200">Aithos</span> 
        </Link>
        
        {/* Navigation Links */}
        <nav className="space-y-2">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              // Using theme-aware colors
              className="flex items-center gap-3 p-3 rounded-lg text-light-100 hover:bg-dark-200/50 transition-colors"
            >
              <link.icon className="size-5 text-primary-200" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Account Details and Logout */}
      <div className="pt-8 border-t border-border">
        {/* User Details */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={userAvatarSrc}
            alt={user.name || "User Avatar"}
            width={40}
            height={40}
            className="rounded-full object-cover size-10 border-2 border-primary-200/50"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-light-100">{user.name || "User Profile"}</span>
            <span className="text-xs text-light-400">{user.email || "N/A"}</span>
          </div>
        </div>
        
        {/* Logout Button */}
        <SignOutButton />
      </div>
    </div>
  );
};

export default InterviewSideNav;