// ved-pandya/test_aithos/test_aithos-7f98104aa6f9ba6e2d00a371a5d6ac4e96919a19/app/layout.tsx

import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aithos",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* The 'pattern' and 'site-dark-gradient' are applied here from globals.css */}
      <body className={`${monaSans.className} antialiased pattern site-dark-gradient`}>
        {children}

        <Toaster />
      </body>
    </html>
  );
}