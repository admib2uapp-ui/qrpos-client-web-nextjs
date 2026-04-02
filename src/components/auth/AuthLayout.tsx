"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import { CheckCircle2, BarChart3, Mic2 } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden bg-background">
      {/* Left Column: Brand & Value Prop */}
      <div className="w-1/2 relative flex flex-col items-center justify-center p-16 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-slate-900 -z-10" />
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/15 rounded-full blur-[100px] animate-pulse [animation-delay:3s]" />
        
        <div className="relative z-10 max-w-xl w-full">
          {/* Logo Section */}
          <div className="mb-12 flex items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-white/5 p-1">
              <img src="/logo.jpeg" alt="LankaQR POS" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black tracking-tighter text-white leading-none">
                QR <span className="text-primary tracking-normal">POS</span>
              </h1>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Merchant Command Center</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <h2 className="text-6xl font-black tracking-tight leading-[1.1] text-white">
                Modernize your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  Payment Ecosystem.
                </span>
              </h2>
              <p className="text-xl text-white/50 font-medium leading-relaxed max-w-lg">
                Experience the next generation of high-speed merchant terminal software with military-grade security and real-time insights.
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Atomic Transaction Sequencing</h4>
                  <p className="text-sm text-white/40">Deterministic 16-digit tracking for perfect reconciliation.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Real-Time Voice Verification</h4>
                  <p className="text-sm text-white/40">Instant audio confirmation for every verified payment.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Premium Data Analytics</h4>
                  <p className="text-sm text-white/40">High-fidelity velocity charts and merchant performance insights.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Accent */}
          <div className="mt-12 pt-12 border-t border-white/5">
            <p className="text-[10px] text-white/20 tracking-[0.4em] uppercase font-black">
              Trusted by 500+ Sri Lankan Enterprises
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Forms */}
      <div className="w-1/2 flex items-center justify-center bg-slate-900/40 relative">
        {/* Subtle grid pattern for the right side */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none dark:invert" />
        
        <div className="w-full max-w-2xl px-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
