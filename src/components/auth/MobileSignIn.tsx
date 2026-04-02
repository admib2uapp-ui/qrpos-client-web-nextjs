"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MobileSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push("/mobile/calculator");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100svh] h-[100svh] bg-background transition-colors duration-300 overflow-y-auto">
      {/* Brand Section - Dynamically scaling based on viewport height */}
      <div className="flex flex-col items-center justify-center pt-[4vh] pb-[3vh] px-[10vw] flex-shrink-0">
        <div className="w-[12vh] h-[12vh] max-w-[80px] max-h-[80px] rounded-2xl bg-white flex items-center justify-center shadow-2xl flex-shrink-0 border border-white/5 p-1 mb-[3vh] relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-[5vh] max-text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none">QR <span className="text-primary tracking-normal">POS</span></h1>
        <p className="text-[1.5vh] max-text-sm font-black text-muted-foreground/40 uppercase tracking-[0.4em] mt-[1.5vh]">Premium QR Payments</p>
      </div>

      {/* Auth Card */}
      <div className="flex-1 px-[6vw] pb-[10vh]">
        <div className="bg-card/50 backdrop-blur-xl rounded-[6vw] p-[6vw] shadow-2xl border border-border/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-[2vw] bg-primary/20 blur-xl" />
          
          <div className="mb-[4vw]">
            <h2 className="text-[6vw] sm:text-xl font-black text-foreground tracking-tight underline decoration-primary/20 underline-offset-4">Welcome Back</h2>
            <p className="text-[3vw] sm:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-[1vw]">Sign in to your merchant terminal</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[2.8vw] sm:text-xs font-bold p-[3vw] rounded-[2vw] mb-[6vw] animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-[4vw]">
            <div className="space-y-[2vw]">
              <label className="text-[2.5vw] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">
                Access Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-[4vw] top-1/2 -translate-y-1/2 w-[4.5vw] h-[4.5vw] text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@b2u.com"
                  className="pl-[12vw] h-[13vw] sm:h-12 rounded-[3.5vw] bg-secondary/30 border-border/40 text-[3.8vw] sm:text-base font-bold transition-all focus:ring-4 focus:ring-primary/10"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-[2vw]">
              <label className="text-[2.5vw] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">
                Terminal Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-[4vw] top-1/2 -translate-y-1/2 w-[4.5vw] h-[4.5vw] text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-[12vw] pr-[12vw] h-[13vw] sm:h-12 rounded-[3.5vw] bg-secondary/30 border-border/40 text-[3.8vw] sm:text-base font-bold transition-all focus:ring-4 focus:ring-primary/10"
                  autoCapitalize="none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[4vw] top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[5vw] h-[5vw]" /> : <Eye className="w-[5vw] h-[5vw]" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/mobile/forgot-password")}
              className="text-[2.8vw] sm:text-xs font-black text-primary/60 hover:text-primary uppercase tracking-widest ml-[1vw] transition-colors"
            >
              Recover Access?
            </button>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[14vw] sm:h-14 rounded-[4vw] bg-primary text-white text-[4vw] sm:text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-[0.97] transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-[6vw] h-[6vw] animate-spin" />
              ) : (
                "Authenticate"
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center mt-[6vw] space-y-[3vw]">
            <p className="text-[3vw] sm:text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
              New merchant? <button onClick={() => router.push("/mobile/signup")} className="text-primary/70 font-black">Register Terminal</button>
            </p>
            <div className="flex items-center gap-[2vw] opacity-20 group cursor-help grayscale hover:grayscale-0 transition-all">
               <span className="text-[2vw] font-black uppercase tracking-[0.3em]">Secured by LankaQR</span>
               <div className="w-[1.5vw] h-[1.5vw] bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
