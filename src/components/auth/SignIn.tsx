"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import { AuthLayout } from "./AuthLayout";

export function SignIn() {
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
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      <div className="w-full">
        {/* Form Card */}
        <div className="glass-card p-8 shadow-2xl border-primary/10">
          <h2 className="text-3xl font-black text-foreground mb-1 tracking-tight uppercase">Welcome Back</h2>
          <p className="text-muted-foreground font-medium mb-8">Secure access to your merchant dashboard</p>

          {error && (
            <div className="bg-rose-500/10 text-rose-500 text-sm p-4 rounded-xl mb-6 border border-rose-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Email Address
              </label>
              <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="flex-1 bg-transparent outline-none text-lg text-foreground font-medium"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 h-14 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent border-none outline-none text-lg text-foreground font-medium tracking-widest pr-12"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase z-10"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="flex justify-center mt-12 pt-8 border-t border-primary/5">
            <span className="text-sm text-muted-foreground font-medium">New merchant?</span>
            <button
              onClick={() => router.push("/signup")}
              className="text-sm font-bold text-primary ml-2 hover:underline tracking-tight"
            >
              Request Access
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/60 font-medium">
            Protected by world-class encryption. <br />
            By signing in, you agree to our <button className="text-primary hover:underline font-bold">Privacy Policy</button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
