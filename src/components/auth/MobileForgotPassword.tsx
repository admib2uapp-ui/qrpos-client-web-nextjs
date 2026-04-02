"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";

type Step = "request" | "verify" | "update" | "success";

export function MobileForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Email not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery"
      });
      if (error) throw error;
      setStep("update");
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Not matching");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col min-h-[100svh] px-8 items-center justify-center bg-background text-center">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">Access Secure</h1>
        <p className="text-muted-foreground font-medium mb-12">Your terminal password has been updated.</p>
        <button
          onClick={() => router.push("/mobile/signin")}
          className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl"
        >
          Open Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100svh] bg-background">
      {/* Brand Section */}
      <div className="flex flex-col items-center justify-center pt-[5vh] pb-[4vh] px-[10vw]">
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl p-1 border border-white/5 mb-6">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tighter tabular-nums uppercase">
          QR <span className="text-primary">POS</span>
        </h1>
        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] mt-2">Security Gate</p>
      </div>

      <div className="flex-1 px-8 pb-12">
        <div className="bg-secondary/20 dark:bg-white/5 rounded-3xl p-8 border border-border/50">
          <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">
            {step === "request" ? "Reset Access" : step === "verify" ? "Verify Code" : "New Pass"}
          </h2>
          <p className="text-sm text-muted-foreground font-medium mb-8">
            {step === "request" ? "Direct recovery to your terminal" : step === "verify" ? "Enter 6-digit security code" : "Set your new encrypted access"}
          </p>

          {error && (
            <div className="bg-rose-500/10 text-rose-500 text-[10px] font-black p-4 rounded-xl mb-6 border border-rose-500/20 uppercase tracking-widest leading-relaxed">
              {error}
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Merchant Email</label>
                <div className="relative group">
                   <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@business.com"
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 h-16 outline-none text-lg font-bold text-foreground focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Code"}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1 text-center">
                <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block mb-4">6-Digit Security Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="000 000"
                  className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-4 h-20 outline-none text-4xl font-black text-foreground tracking-[0.4em] text-center focus:border-primary transition-all tabular-nums"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify Identity"}
              </button>
              <button 
                type="button"
                onClick={() => setStep("request")}
                className="w-full py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest"
              >
                Try different email
              </button>
            </form>
          )}

          {step === "update" && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 h-16 outline-none text-lg font-bold text-foreground focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Confirm Pass</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-secondary/30 border rounded-2xl px-5 h-16 outline-none text-lg font-bold text-foreground transition-all ${confirmPassword && confirmPassword !== password ? "border-rose-500 focus:border-rose-500" : "border-border/50 focus:border-primary"}`}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !password || password !== confirmPassword}
                className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Set New Pass"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
           <button
             onClick={() => router.push("/mobile/signin")}
             className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
           >
             Return to Security Gate
           </button>
        </div>
      </div>
    </div>
  );
}
