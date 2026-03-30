"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MobileSignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword || !fullName || !companyName || !whatsappNumber) {
      setError("Complete all fields");
      return;
    }

    if (password.length < 6) {
      setError("Min. 6 characters required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords mismatch");
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
      <div className="flex flex-col h-screen bg-background items-center justify-center px-[10vw]">
        <div className="bg-card/50 backdrop-blur-xl rounded-[6vw] p-[10vw] border border-border/40 shadow-2xl text-center space-y-[6vw]">
          <div className="w-[20vw] h-[20vw] bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-[10vw] h-[10vw] text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[6vw] font-black tracking-tight underline decoration-emerald-500/20 underline-offset-4">Success!</h1>
            <p className="text-[3vw] font-bold text-muted-foreground/60 uppercase tracking-widest mt-[2vw]">Verify your email to activate terminal.</p>
          </div>
          <Button
            onClick={() => router.push("/mobile/signin")}
            className="w-full h-[12vw] rounded-full bg-primary font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background transition-colors duration-300 overflow-y-auto pb-[10vh]">
      {/* Brand Section */}
      <div className="flex flex-col items-center justify-center pt-[10vh] pb-[6vh] px-[10vw]">
        <div className="w-[18vw] h-[18vw] max-w-[80px] max-h-[80px] rounded-[5vw] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 mb-[4vw]">
          <QrCode className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] text-white" />
        </div>
        <h1 className="text-[8vw] sm:text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none">Register POS</h1>
        <p className="text-[3vw] sm:text-sm font-black text-muted-foreground/40 uppercase tracking-[0.4em] mt-[2vw]">Setup Merchant Node</p>
      </div>

      {/* Auth Card */}
      <div className="px-[6vw]">
        <div className="bg-card/50 backdrop-blur-xl rounded-[6vw] p-[8vw] shadow-2xl border border-border/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-[2vw] bg-primary/20 blur-xl" />
          
          <div className="mb-[6vw]">
            <h2 className="text-[6vw] sm:text-xl font-black text-foreground tracking-tight underline decoration-primary/20 underline-offset-4">Create Account</h2>
            <p className="text-[3vw] sm:text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-[1vw]">Initialize your terminal access</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[2.8vw] sm:text-xs font-bold p-[3vw] rounded-[2vw] mb-[6vw]">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-[4vw]">
            <div className="space-y-[1.5vw]">
              <label className="text-[2.2vw] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">Full Name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="h-[12vw] sm:h-12 rounded-[3vw] bg-secondary/30 border-border/40 text-[3.5vw] font-bold"
                required
              />
            </div>

            <div className="space-y-[1.5vw]">
              <label className="text-[2.2vw] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">Company Name</label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Lanka Solutions PBC"
                className="h-[12vw] sm:h-12 rounded-[3vw] bg-secondary/30 border-border/40 text-[3.5vw] font-bold"
                required
              />
            </div>

            <div className="space-y-[1.5vw]">
              <label className="text-[2.2vw] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">WhatsApp Number</label>
              <Input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+94 77 123 4567"
                className="h-[12vw] sm:h-12 rounded-[3vw] bg-secondary/30 border-border/40 text-[3.5vw] font-bold"
                required
              />
            </div>

            <div className="space-y-[1.5vw]">
              <label className="text-[2.2vw] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@b2u.pos"
                className="h-[12vw] sm:h-12 rounded-[3vw] bg-secondary/30 border-border/40 text-[3.5vw] font-bold"
                autoCapitalize="none"
              />
            </div>

            <div className="space-y-[1.5vw]">
              <label className="text-[2.2vw] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">Secure Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-[12vw] sm:h-12 rounded-[3vw] bg-secondary/30 border-border/40 text-[3.5vw] font-bold"
              />
            </div>

            <div className="space-y-[1.5vw]">
              <label className="text-[2.2vw] sm:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-[1vw]">Confirm Pin</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-[12vw] sm:h-12 rounded-[3vw] bg-secondary/30 border-border/40 text-[3.5vw] font-bold"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[14vw] sm:h-14 rounded-[4vw] bg-primary text-white text-[4vw] font-black uppercase tracking-[0.2em] shadow-xl mt-[4vw] active:scale-[0.97]"
            >
              {isLoading ? (
                <Loader2 className="w-[6vw] h-[6vw] animate-spin" />
              ) : (
                "Deploy Account"
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center mt-[8vw] space-y-[4vw]">
            <p className="text-[3vw] sm:text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
              Existing terminal? <button onClick={() => router.push("/mobile/signin")} className="text-primary/70 font-black">Login Page</button>
            </p>
          </div>
        </div>

        <div className="text-center mt-[6vw] opacity-30">
           <p className="text-[2vw] font-black uppercase tracking-[0.4em]">Proprietary POS OS v2.0</p>
        </div>
      </div>
    </div>
  );
}
