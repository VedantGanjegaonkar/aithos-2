import { 
  ShieldCheck, 
  Zap, 
  Target, 
  MessageSquare, 
  Globe, 
  Activity,
  BrainCircuit,
  Award,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const journeySteps = [
    { id: "01", title: "Profile Integration", desc: "Upload CV and SOP for AITHOS to analyze your unique background and narrative." },
    { id: "02", title: "Scenario Selection", desc: "Select target colleges to match their specific institution culture and rigor." },
    { id: "03", title: "Live Interview", desc: "Engage in a voice-based conversation featuring adaptive, probing follow-up questions." },
    { id: "04", title: "Instant Evaluation", desc: "Receive a granular feedback report scoring your content and confidence within minutes." }
  ];

  const metrics = ['Logic & Content', 'Confidence & Delivery', 'Current Affairs', 'SOP Scrutiny'];

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 space-y-28 animate-fadeIn text-white">
      
      {/* --- HERO SECTION --- */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-200 text-xs font-bold uppercase tracking-widest mb-4">
          The New Standard in MBA Admissions
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Master Your <span className="text-primary-200">Narrative</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
          At AITHOS, we believe the only thing standing between a talented candidate and their dream B-school shouldn't be nerves or a lack of personalized guidance. We’ve engineered a sophisticated AI mock interview platform specifically for the high-stakes world of MBA admissions.
        </p>
      </section>

      {/* --- CORE ADVANTAGE GRID --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold uppercase tracking-tighter italic text-primary-200">The AI Advantage</h2>
          <div className="space-y-6">
            <div className="flex gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary-200/30 transition-colors">
              <ShieldCheck className="text-primary-200 w-10 h-10 shrink-0" />
              <div>
                <h4 className="font-bold text-lg">Eliminating Human Subjectivity</h4>
                <p className="text-gray-500 text-sm mt-1">
                  AITHOS removes barriers like mentor availability and human bias. We evaluate you purely on the merit of your logic, communication, and content.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary-200/30 transition-colors">
              <BrainCircuit className="text-primary-200 w-10 h-10 shrink-0" />
              <div>
                <h4 className="font-bold text-lg">Limitless Knowledge Base</h4>
                <p className="text-gray-500 text-sm mt-1">
                  No single human can stay updated on every trend. AITHOS draws from a massive, real-time database to ensure your prep is always relevant.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-primary-200/10 blur-[120px] rounded-full group-hover:bg-primary-200/20 transition-all" />
          <div className="relative p-10 bg-dark-200/80 border border-white/10 rounded-[40px] backdrop-blur-xl shadow-2xl">
            <Activity className="text-primary-200 w-12 h-12 mb-6" />
            <h3 className="text-2xl font-bold mb-4">Adaptive Intelligence</h3>
            <p className="text-gray-400 leading-relaxed mb-8">
              AITHOS is a dynamic conversational AI that listens, understands, and evolves the interview in real-time. It asks probing follow-up questions to test the depth of your thinking.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['Real-time Evolution', 'Contextual Logic', 'SOP Scrutiny', 'Instant Feedback'].map((tag) => (
                <div key={tag} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-center text-gray-500">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE CARDS --- */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Specialized MBA Expertise</h2>
          <p className="text-gray-500">Tailored preparation for the world's most elite institutions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-200/50 border border-white/5 p-8 rounded-[32px] hover:border-primary-200/20 transition-all group">
            <Target className="text-primary-200 w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3">Deep Personalization</h3>
            <p className="text-sm text-gray-500 leading-relaxed">We analyze your educational background and work experience to tailor questions specifically to your profile.</p>
          </div>
          <div className="bg-dark-200/50 border border-white/5 p-8 rounded-[32px] hover:border-primary-200/20 transition-all group">
            <Award className="text-primary-200 w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3">Tiered Prep</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Integrated knowledge for Tier 1, 2, 3, IIMs, Ivy Leagues, and specialized European programs.</p>
          </div>
          <div className="bg-dark-200/50 border border-white/5 p-8 rounded-[32px] hover:border-primary-200/20 transition-all group">
            <Globe className="text-primary-200 w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3">Real-World Context</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Preparation covering business concepts, dynamic current affairs, and the global economy.</p>
          </div>
        </div>
      </section>

      {/* --- THE JOURNEY --- */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-center italic">The Journey to the Admit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {journeySteps.map((item) => (
            <div key={item.id} className="relative">
              <div className="text-6xl font-black text-white/5 absolute inset-x-0 -top-8 -z-10">{item.id}</div>
              <h4 className="font-bold text-white mb-3">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- PRICING CTA --- */}
      <section className="text-center bg-primary-200 rounded-[48px] p-12 md:p-20 space-y-8 shadow-2xl shadow-primary-200/10">
        <h2 className="text-dark-300 text-4xl md:text-6xl font-black leading-tight">
          Accessible. Affordable. <br />Adaptive Prep.
        </h2>
        <p className="text-dark-300/80 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
          AITHOS operates on a transparent Subscription and Pay-Per-Interview model. Practice exactly when you need to without upfront coaching fees.
        </p>
        <div className="flex justify-center pt-4">
          <Link href="/dashboard">
            <Button className="bg-dark-300 text-white hover:bg-black rounded-full px-12 py-7 text-xl font-bold transition-all hover:scale-105 active:scale-95">
              Start Your Simulation
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}