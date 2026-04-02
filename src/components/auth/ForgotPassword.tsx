"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { AuthLayout } from "./AuthLayout";
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";

type Step = "request" | "verify" | "update" | "success";

export function ForgotPassword() {
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
      setError(err.message || "Failed to send recovery email");
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
      setError(err.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <AuthLayout title="Security Updated" subtitle="Your access is secured">
        <div className="w-full">
          <div className="glass-card p-10 text-center shadow-2xl border-emerald-500/10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 mb-8 border border-emerald-500/20">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight uppercase">Success!</h1>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
              Your password has been reset successfully. <br />
              You can now access your merchant terminal.
            </p>

            <button
              onClick={() => router.push("/signin")}
              className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={step === "request" ? "Reset Access" : step === "verify" ? "Verify Code" : "New Password"} 
      subtitle={step === "request" ? "We'll send a 6-digit security code" : step === "verify" ? `Check your email: ${email}` : "Set a secure terminal password"}
    >
      <div className="w-full">
        <div className="glass-card p-10 shadow-2xl border-primary/10">
          <h2 className="text-3xl font-black text-foreground mb-1 tracking-tight uppercase">
            {step === "request" ? "Reset Access" : step === "verify" ? "Verify Code" : "New Password"}
          </h2>
          <p className="text-muted-foreground font-medium mb-8">
            {step === "request" ? "We'll send a 6-digit security code" : step === "verify" ? `Check your email: ${email}` : "Set a secure terminal password"}
          </p>

          {error && (
            <div className="bg-rose-500/10 text-rose-500 text-xs font-bold p-4 rounded-xl mb-8 border border-rose-500/20 uppercase tracking-wider">
              {error}
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Merchant Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@business.com"
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-12 pr-4 h-14 outline-none text-lg font-bold text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    Send Recovery Code
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">6-Digit Security Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-12 pr-4 h-14 outline-none text-3xl font-black text-foreground tracking-[0.5em] text-center focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:tracking-normal placeholder:text-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify Identity"}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {step === "update" && (
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 outline-none text-lg font-bold text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-primary/5 border rounded-xl px-4 h-14 outline-none text-lg font-bold text-foreground transition-all ${confirmPassword && confirmPassword !== password ? "border-rose-500 ring-4 ring-rose-500/10 focus:border-rose-500 focus:ring-rose-500/20" : "border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || password !== confirmPassword}
                className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Secure Account"}
              </button>
            </form>
          )}

          <div className="flex justify-center mt-10 pt-8 border-t border-primary/5">
            <button
              onClick={() => router.push("/signin")}
              className="text-xs font-bold text-primary hover:underline tracking-widest uppercase"
            >
              Back to Security Gate
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
