// components/Footer.tsx

import Link from "next/link";
import Image from "next/image";

// Define the navigation groups for the footer
const FOOTER_LINKS = {
  Product: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pricing", href: "/" },
    { name: "Features", href: "/features" }, // Even if not in Navbar, good for SEO/completeness
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

// Define social media links
const SOCIAL_LINKS = [
  { name: "instagram", href: "#", icon: "/instagram.jpg" }, // Assuming you have these icons
  { name: "Twitter", href: "#", icon: "/twitter.png" },
  { name: "YouTube", href: "#", icon: "/youtube.png" },
];

const Footer = () => {
  return (
    <footer className="
      mt-24 py-16 px-4 border-t border-gray-700/50 bg-gradient-to-r from-dark-100 to-dark-800
    ">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 border-b border-gray-700/50 pb-10">
          
          {/* 1. Brand/Social Section (Takes 2 columns on mobile/tablet) */}
          <div className="col-span-2 md:col-span-2 flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Aithos Logo" width={32} height={32} />
              <span className="text-2xl font-bold text-primary-200">Aithos</span> 
            </Link>
            <p className="text-gray-400 max-w-xs text-sm">
              AI-Powered interview practice and feedback platform. Master your next career move.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              {SOCIAL_LINKS.map((link) => (
                <Link key={link.name} href={link.href} aria-label={link.name}>
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={30}
                    height={30}
                    className="filter opacity-75 hover:opacity-100 transition-opacity"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Navigation Sections (Takes 1 column each) */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="flex flex-col space-y-4">
              <h4 className="text-lg font-semibold text-white mb-2">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary-200 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* 3. Copyright/Bottom Text */}
        <div className="mt-8 text-center md:text-left">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Aithos. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;