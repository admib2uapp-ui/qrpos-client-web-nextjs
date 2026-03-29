"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, X, Share2, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { generateQRData } from "../../lib/qrService";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { useTransactionStatus } from "../../hooks/useTransactionStatus";

export function MobileQRDisplay() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const amount = searchParams.get("amount") || "0";
  const refNo = searchParams.get("ref") || "";

  const { isSuccess } = useTransactionStatus(refNo, amount);

  useEffect(() => {
    if (!user) return;
    const fetchQR = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const base64 = await generateQRData(amount, refNo, user.id);
        setQrBase64(base64);
      } catch (err: any) {
        console.error('Failed to generate QR:', err);
        setError(err.message || 'Failed to generate QR code');
      } finally {
        setIsGenerating(false);
      }
    };
    fetchQR();
  }, [user, amount, refNo]);

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00";
    const parts = num.toFixed(2).split(".");
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${parts[1]}`;
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden font-sans relative transition-colors duration-300">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Header */}
      <div className="px-[6vw] pt-[2vh] pb-[1vh] flex items-center justify-between z-10">
        <button
          onClick={() => router.push("/mobile/calculator")}
          className="w-[10vw] h-[10vw] max-w-[44px] max-h-[44px] rounded-full bg-secondary text-foreground/60 border border-border/50 flex items-center justify-center active:scale-95 transition-all shadow-sm"
        >
          <X className="w-[5vw] h-[5vw]" />
        </button>
        
        <div className="px-[4vw] py-[1.5vw] rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
           <div className="flex items-center gap-[2vw]">
              {!isSuccess && !error && <div className="w-[1.5vw] h-[1.5vw] max-w-[8px] max-h-[8px] bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />}
              <span className="text-[2.2vw] sm:text-[10px] font-bold text-primary uppercase tracking-widest text-center">
                {isGenerating ? "Encrypting..." : isSuccess ? "Payment Confirmed" : "Live Checkout"}
              </span>
           </div>
        </div>
      </div>

      {/* Success Celebration Overlay */}
      {isSuccess && (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-xl animate-in fade-in duration-700">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-30 animate-pulse" />
               <div className="relative w-[30vw] h-[30vw] max-w-[128px] max-h-[128px] bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-in zoom-in spin-in-12 duration-700">
                  <CheckCircle2 className="w-[15vw] h-[15vw] max-w-[64px] max-h-[64px] text-white" />
               </div>
            </div>
            <h2 className="mt-[4vh] text-[10vw] sm:text-5xl font-bold tracking-tighter text-foreground animate-in slide-in-from-bottom-4 duration-1000">Received!</h2>
            <p className="mt-[1vh] text-[3.5vw] sm:text-lg text-muted-foreground font-medium">LKR {formatAmount(amount)} confirmed.</p>
            <button
               onClick={() => router.push("/mobile/calculator")}
               className="mt-[6vh] px-[12vw] py-[3vh] bg-primary text-primary-foreground rounded-full font-bold shadow-2xl active:scale-95 transition-all text-[4vw] sm:text-lg"
            >
               BACK TO HOME
            </button>
         </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-[8vw] z-10">
        
        <div className="w-full text-center mb-[4vh]">
           <p className="text-[2.5vw] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-[1vh] opacity-60">Total Amount</p>
           <h2 className="text-[16vw] sm:text-7xl font-black tracking-tighter flex items-center justify-center gap-[2vw] text-foreground leading-none">
              <span className="text-[4vw] sm:text-xl font-light text-primary/60">LKR</span>
              {formatAmount(amount)}
           </h2>
        </div>

        {/* QR Card - Relative to width but max sized */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/40 to-emerald-500/40 rounded-[10vw] blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
          
          <div className="w-[75vw] h-[75vw] max-w-[320px] max-h-[320px] bg-white rounded-[8vw] shadow-2xl flex items-center justify-center p-[8vw] border-8 border-black/5 dark:border-white/5 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-[4vw]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[2.5vw] sm:text-[10px] font-black text-black/20 uppercase tracking-widest">Generating...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-[4vw] text-destructive text-center">
                <AlertCircle className="w-10 h-10" />
                <p className="text-[3vw] sm:text-xs font-bold px-[4vw]">{error}</p>
                <button onClick={() => window.location.reload()} className="text-[2.5vw] sm:text-[10px] uppercase font-black underline">Tap to Retry</button>
              </div>
            ) : qrBase64 ? (
              <img 
                src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`} 
                alt="Payment QR" 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            ) : null}
          </div>
        </div>

        {/* Reference Info */}
        <div className="mt-[6vh] flex flex-col items-center">
           <div className="px-[5vw] py-[2.5vw] rounded-[4vw] bg-secondary border border-border/50 backdrop-blur-md shadow-sm text-center">
              <span className="text-[2.5vw] sm:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block mb-[0.5vh]">REFERENCE NO</span>
              <span className="text-[4vw] sm:text-lg font-mono font-bold text-foreground tracking-widest">{refNo || "---"}</span>
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-[6vw] pb-16 flex flex-col gap-[3vw] z-10">
         <button className="w-full h-[8vh] min-h-[56px] rounded-[4vw] bg-secondary border border-border/50 flex items-center justify-center gap-[3vw] text-foreground font-bold active:bg-secondary/80 active:scale-95 transition-all shadow-sm text-[3.8vw] sm:text-base">
            <Share2 className="w-[5vw] h-[5vw] text-primary" />
            Share Payment Link
         </button>
         <button 
            onClick={() => router.push("/mobile/calculator")}
            className="w-full h-[6vh] rounded-[4vw] text-muted-foreground/50 text-[3vw] sm:text-[10px] font-bold uppercase tracking-widest active:text-muted-foreground transition-all"
         >
            Cancel and Return
         </button>
      </div>
    </div>
  );
}
