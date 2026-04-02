"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import { AuthLayout } from "./AuthLayout";

export function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword || !fullName || !companyName || !whatsappNumber) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            whatsapp_number: whatsappNumber,
          }
        }
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your Email" subtitle="Verification link sent">
        <div className="w-full">
          <div className="glass-card p-10 text-center shadow-2xl border-emerald-500/10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 mb-8 border border-emerald-500/20">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight uppercase">Account Created!</h1>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
              We've sent a verification link to <span className="text-primary font-bold">{email}</span>. <br />
              Please check your inbox to activate your terminal.
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
    <AuthLayout title="Get Started" subtitle="Create your merchant profile">
      <div className="w-full max-h-[90vh] overflow-y-auto no-scrollbar py-4 px-1">
        {/* Form Card */}
        <div className="glass-card p-8 shadow-2xl border-primary/10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground mb-1 tracking-tight uppercase">Join Network</h2>
            <p className="text-muted-foreground font-medium">Request terminal access for your business</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 text-rose-500 text-sm p-4 rounded-xl mb-6 border border-rose-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Full Name - Full Width */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Full Merchant Name</label>
              <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="flex-1 bg-transparent outline-none text-lg font-bold text-foreground"
                  required
                />
              </div>
            </div>

            {/* Email - Full Width */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Access Email</label>
              <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@business.com"
                  className="flex-1 bg-transparent outline-none text-lg font-bold text-foreground"
                  required
                />
              </div>
            </div>

            {/* Company Name - Row 3 Col 1 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Company Name</label>
              <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Lanka Solutions"
                  className="flex-1 bg-transparent outline-none text-lg font-bold text-foreground"
                  required
                />
              </div>
            </div>

            {/* WhatsApp Number - Row 3 Col 2 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">WhatsApp (OTP)</label>
              <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="flex-1 bg-transparent outline-none text-lg font-bold text-foreground"
                  required
                />
              </div>
            </div>

            {/* Password - Row 4 Col 1 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-foreground tracking-widest pr-12"
                    required
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary uppercase hover:text-primary/80 transition-colors z-10"
                >
                   {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password - Row 4 Col 2 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Confirm Access</label>
              <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-foreground tracking-widest"
                  required
                />
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Request Terminal"
                )}
              </button>
            </div>
          </form>

          {/* Switch Mode */}
          <div className="flex justify-center mt-8 pt-6 border-t border-primary/5">
            <span className="text-sm text-muted-foreground font-medium">Already registered?</span>
            <button
              onClick={() => router.push("/signin")}
              className="text-sm font-bold text-primary ml-2 hover:underline tracking-tight"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tighter">
            By creating an account, you agree to our <button className="text-primary hover:underline font-bold">Terms & Privacy Policy</button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
