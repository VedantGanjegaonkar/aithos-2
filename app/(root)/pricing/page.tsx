"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Zap, Award, Crown, TrendingDown } from "lucide-react";

// 1. Firebase Client Import
import { auth } from "@/firebase/client"; 
import { onAuthStateChanged, User } from "firebase/auth";

// 2. UI Components
import { Button } from "@/components/ui/button";

const PRICING_PLANS = [
  {
    name: "Starter",
    tokens: 1,
    price: 500,
    costPerSession: 500,
    savings: 0,
    icon: <Zap className="w-6 h-6 text-primary-200" />,
    popular: false,
  },
  {
    name: "Recommended",
    tokens: 3,
    price: 900,
    costPerSession: 300,
    savings: 600,
    icon: <Award className="w-6 h-6 text-primary-200" />,
    popular: true,
  },
  {
    name: "Elite",
    tokens: 5,
    price: 1000,
    costPerSession: 200,
    savings: 1500,
    icon: <Crown className="w-6 h-6 text-primary-200" />,
    popular: false,
  },
];

const PricingPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  // 3. Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePayment = async (plan: typeof PRICING_PLANS[0]) => {
    // A. Auth Guard
    if (!currentUser) {
      toast.error("Please sign in to purchase credits");
      return;
    }

    // B. SDK Guard - If script isn't ready, wait a moment
    if (!(window as any).Razorpay) {
      toast.error("Payment gateway is still loading. Please wait a second and try again.");
      return;
    }

    const loadingToast = toast.loading("Initializing secure payment...");

    try {
      // Step 1: Create Order on Backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          userId: currentUser.uid, 
          tokens: plan.tokens,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${res.status}`);
      }
      
      const order = await res.json();
      toast.dismiss(loadingToast);

      // Step 2: Configure Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "AITHOS AI",
        description: `Refill ${plan.tokens} Interview Tokens`,
        order_id: order.id,
        handler: function (response: any) {
          // Note: This client-side handler is for UI feedback.
          // The ACTUAL credit update happens in your webhook!
          toast.success("Payment successful! Updating your dashboard...");
          router.push("/dashboard");
        },
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        },
        theme: { color: "#BFFF00" },
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Payment Error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      {/* 4. Razorpay SDK Script */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="afterInteractive"
        onLoad={() => setIsSDKLoaded(true)}
      />

      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-white">
          Accessible. <span className="text-primary-200">Affordable.</span>
        </h1>
        <p className="text-gray-400 text-lg italic">
          High-fidelity AI interviews at a fraction of the cost of traditional coaching.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PRICING_PLANS.map((plan) => (
          <div 
            key={plan.name}
            className={`relative group rounded-[32px] p-8 border transition-all duration-300 ${
              plan.popular 
                ? "bg-white/10 border-primary-200 shadow-[0_0_40px_-15px_rgba(191,255,0,0.4)] scale-105 z-10" 
                : "bg-white/5 border-white/10 hover:border-white/20"
            } backdrop-blur-xl flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-200 text-dark-300 text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-6">{plan.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">₹{plan.price}</span>
              <span className="text-gray-500 text-sm font-medium">total</span>
            </div>

            <div className="space-y-4 mb-10 flex-grow border-t border-white/5 pt-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary-200 shrink-0" />
                <span className="text-gray-300 text-sm">
                  <strong className="text-white">{plan.tokens}</strong> Full AI Interview{plan.tokens > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary-200 shrink-0" />
                <span className="text-gray-300 text-sm">
                  Cost: <strong className="text-white">₹{plan.costPerSession}</strong> / interview
                </span>
              </div>

              {plan.savings > 0 && (
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-green-400 text-sm font-bold">Save ₹{plan.savings}</span>
                </div>
              )}
            </div>

            <Button 
              disabled={isAuthLoading}
              onClick={() => handlePayment(plan)}
              className={`w-full py-7 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                plan.popular 
                  ? "bg-primary-200 text-dark-300 hover:opacity-90 shadow-lg shadow-primary-200/20" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isAuthLoading ? "Loading..." : `Buy ${plan.tokens} Tokens`}
            </Button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-600 text-[10px] uppercase tracking-[0.3em] mt-20 font-bold">
        Secure Checkout • Tokens never expire • Instant Activation
      </p>
    </div>
  );
};

export default PricingPage;