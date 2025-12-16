// app/(root)/page.tsx (Landing Page - Final Version with Large Image Area)

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

// --- FeatureCard Component (Image Container set to a large, fixed square) ---
const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
    // Card Container: rounded-2xl corners, dark background
    <div className="p-6 bg-dark-300 rounded-2xl border border-border shadow-xl transition hover:border-primary-200">
        
        {/* ICON CONTAINER: SET TO APPROXIMATELY 480x480 */}
        {/* We use w-full (which is determined by the grid column width) 
           and a large, fixed height (h-[480px]) to achieve the requested size. */}
        <div className="relative w-full h-[480px] bg-dark-100 rounded-lg mb-6 overflow-hidden">
            <Image 
                src={icon} 
                alt={title} 
                // Set the intrinsic size properties to the requested dimensions
                width={480} 
                height={480} 
                // STRETCH TO FILL CONTAINER: w-full and h-full 
                // object-cover forces the image to cover the entire 480x480 area
                className="w-full h-full object-cover" 
            />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);
// --- End FeatureCard Component ---


// This is an async Server Component to determine authentication status
export default async function LandingPage() {
    
    // Fetch user status
    const user = await getCurrentUser();
    const isAuthenticated = !!user;
    
    // Determine target links and button text conditionally
    const primaryLink = isAuthenticated ? "/dashboard" : "/sign-in";
    const heroButtonText = isAuthenticated ? "Go to Dashboard" : "Start Interview Practice Now";
    const ctaButtonText = isAuthenticated ? "Go to Dashboard" : "Sign In / Sign Up";


    return (
        <main className="flex flex-col gap-24">
            
            {/* SECTION 1: HERO */}
            <section className="flex flex-col lg:flex-row items-center justify-between py-24 gap-12 text-center lg:text-left">
                <div className="lg:max-w-xl">
                    <h1 className="text-6xl font-extrabold mb-6 leading-tight text-white">
                        Master Your Interview with <span className="text-primary-200">AI-Driven Feedback</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Practice real-world scenarios, get instant analysis on your speaking, and structure your perfect answer. Stop guessing, start succeeding.
                    </p>
                    {/* Hero CTA Link (Conditional) */}
                    <Link href={primaryLink}>
                        <Button className="btn-call call-button-gradient text-lg px-8 py-6 shadow-lg shadow-primary-200/40 transition duration-300">
                            {heroButtonText}
                        </Button>
                    </Link>
                </div>
                <div className="w-full lg:w-1/2 flex justify-center">
                    <Image
                        src="/robot.png"
                        alt="AI Interviewer"
                        width={450}
                        height={450}
                        className="animate-float"
                    />
                </div>
            </section>

            {/* SECTION 2: CORE FEATURES */}
            <section className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
                <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
                    Our platform analyzes every aspect of your performance, from content to delivery.
                </p>
                
                {/* NOTE: With images this large, the layout might look crowded or require horizontal scrolling on smaller screens. */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        title="Real-time Speech Analysis"
                        icon="/mic.jpg"
                        description="Identify filler words, speaking pace, and clarity instantly, just like a real conversation."
                    />
                    <FeatureCard 
                        title="Content & Structure Grading"
                        icon="/clipboard.jpg"
                        description="Receive comprehensive feedback on the effectiveness and organization of your answers."
                    />
                    <FeatureCard 
                        title="Industry-Specific Roles"
                        icon="/code.jpg"
                        description="Practice with AI interviewers specialized in specific industries and technical stacks."
                    />
                </div>
            </section>

            {/* SECTION 3: CALL TO ACTION (CTA) */}
            <section className="text-center bg-dark-200 p-16 rounded-xl border border-border shadow-2xl">
                <h2 className="text-4xl font-bold text-primary-200 mb-4">Ready to Level Up Your Interview Skills?</h2>
                <p className="text-xl text-gray-300 mb-8">
                    Join thousands of professionals mastering their careers with Aithos.
                </p>
                {/* Bottom CTA Link (Conditional) */}
                <Link href={primaryLink}>
                    <Button className="btn-call text-lg px-8 py-4 bg-primary-200 hover:bg-primary-300 transition duration-300">
                        {ctaButtonText}
                    </Button>
                </Link>
            </section>

        </main>
    );
}