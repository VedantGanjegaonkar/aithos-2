"use client";

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Assuming this is your custom button

// Define your key navigation items
const NAV_LINKS = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle function for the mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    // Fixed container: Dark gradient background and high Z-index
    <nav className="
        fixed top-0 left-0 w-full z-50 
        py-4 px-16 max-sm:px-4 
        bg-gradient-to-r from-dark-100 to-dark-800 // Using your theme dark colors
        shadow-xl border-b border-gray-700/50 
    ">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        
        {/* --- 1. LOGO / BRAND --- */}
        <Link href="/" className="flex items-center space-x-2">
          {/* Replace with your actual logo path and ensure text color is white/vibrant */}
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

        {/* --- 3. DESKTOP CTAS & AUTH LINKS --- */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Log In</Link>
          
          {/* Primary CTA Button (using your btn-primary style) */}
          <Button className="btn-primary"> 
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* --- 4. MOBILE HAMBURGER ICON (Visible only on mobile) --- */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {/* Use a simple SVG or character for the hamburger icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
          </svg>
        </button>
      </div>

      {/* --- 5. MOBILE MENU (Conditional Rendering) --- */}
      {/* Dynamic classes for smooth slide-down effect */}
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
              onClick={() => setIsOpen(false)} // Close menu on click
              className="text-gray-300 hover:text-primary-200 transition-colors block py-2 text-base font-medium"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Auth Links */}
          <Link href="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors block py-2 text-base font-medium border-t border-gray-700/50">Log In</Link>
          <Button className="btn-primary w-full mt-2"> 
            <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;