// components/NavBar.tsx
"use client";

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";
import { CreditBadge } from "./CreditBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, ReceiptText, LogOut, ChevronDown, User } from "lucide-react";

interface User {
  name: string;
  email: string;
  id: string;
  profileURL?: string;
}

interface NavBarProps {
  isAuthenticated: boolean;
  user: User | null;
}

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

const NavBar = ({ isAuthenticated, user }: NavBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const toggleMenu = () => setIsOpen(!isOpen);

  const userAvatarSrc = user?.profileURL || "/user-avatar.png";

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-4 px-16 max-sm:px-4 bg-gradient-to-r from-dark-100 to-dark-800 shadow-xl border-b border-gray-700/50">
      <div className="flex items-center justify-between mx-auto max-w-7xl">

        {/* --- 1. LOGO --- */}
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

        {/* --- 3. DESKTOP USER SECTION --- */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated && user ? (
            <>
              <CreditBadge userId={user.id} />

              <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                <DropdownMenu>
                  {/* Trigger on Hover/Click */}
                  <DropdownMenuTrigger className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors outline-none group">
                    <Image
                      src={userAvatarSrc}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover size-8 border-2 border-primary-200/50"
                    />
                    <span className="text-sm font-semibold hidden lg:inline">{user.name}</span>
                    <ChevronDown className="w-4 h-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                  </DropdownMenuTrigger>

                  {/* Dropdown Content */}
                  <DropdownMenuContent align="end" className="w-56 bg-dark-200 border-gray-700 text-white shadow-2xl mt-2 animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</span>
                      <span className="text-[10px] text-gray-500 truncate">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer py-2 hover:text-primary-200">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/transactions" className="flex items-center gap-2 cursor-pointer py-2 hover:text-primary-200">
                        <ReceiptText className="w-4 h-4" />
                        <span>Past Transactions</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-700" />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 cursor-pointer py-2 text-red-400 focus:bg-red-400/10 focus:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-gray-300 hover:text-white transition-colors text-sm">Log In</Link>
              <Button className="btn-primary hidden md:inline-flex" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* --- 4. MOBILE HAMBURGER --- */}
        <button onClick={toggleMenu} className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
          </svg>
        </button>
      </div>

      {/* --- 5. MOBILE MENU --- */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'} border-t border-gray-700/50`}>
        <div className="flex flex-col space-y-3 pt-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-300 block py-2 text-base font-medium">
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link href="/dashboard/transactions" onClick={() => setIsOpen(false)} className="text-gray-300 block py-2 text-base">
                Past Transactions
              </Link>
              <Button variant="ghost" className="text-red-400 justify-start p-0 h-auto py-2" onClick={handleSignOut}>
                Log Out
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;