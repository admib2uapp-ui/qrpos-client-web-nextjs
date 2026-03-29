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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50 dark:opacity-100 h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Header */}
      <div className="px-6 pt-4 pb-4 flex items-center justify-between z-10">
        <button
          onClick={() => router.push("/mobile/calculator")}
          className="w-10 h-10 rounded-full bg-secondary text-foreground/60 border border-border/50 flex items-center justify-center active:scale-95 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
           <div className="flex items-center gap-2">
              {!isSuccess && !error && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />}
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
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
               <div className="relative w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-in zoom-in spin-in-12 duration-700">
                  <CheckCircle2 className="w-16 h-16 text-white" />
               </div>
            </div>
            <h2 className="mt-8 text-4xl font-bold tracking-tighter text-foreground animate-in slide-in-from-bottom-4 duration-1000">Received!</h2>
            <p className="mt-2 text-muted-foreground font-medium">LKR {formatAmount(amount)} confirmed.</p>
            <button
               onClick={() => router.push("/mobile/calculator")}
               className="mt-12 px-12 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-2xl active:scale-95 transition-all"
            >
               BACK TO HOME
            </button>
         </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10">
        
        <div className="w-full text-center mb-10">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2 opacity-60">Total Amount</p>
           <h2 className="text-6xl font-black tracking-tighter flex items-center justify-center gap-2 text-foreground">
              <span className="text-xl font-light text-primary/60">LKR</span>
              {formatAmount(amount)}
           </h2>
        </div>

        {/* QR Card */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/40 to-emerald-500/40 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
          
          <div className="w-72 h-72 bg-white rounded-[32px] shadow-2xl flex items-center justify-center p-8 border-8 border-black/5 dark:border-white/5 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Generating...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 text-destructive text-center">
                <AlertCircle className="w-10 h-10" />
                <p className="text-xs font-bold px-4">{error}</p>
                <button onClick={() => window.location.reload()} className="text-[10px] uppercase font-black underline">Tap to Retry</button>
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
        <div className="mt-12 flex flex-col items-center">
           <div className="px-5 py-2.5 rounded-2xl bg-secondary border border-border/50 backdrop-blur-md shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block mb-1">REFERENCE NO</span>
              <span className="text-lg font-mono font-bold text-foreground tracking-widest">{refNo || "---"}</span>
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 pb-16 flex flex-col gap-4 z-10">
         <button className="w-full h-16 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center gap-3 text-foreground font-bold active:bg-secondary/80 active:scale-95 transition-all shadow-sm">
            <Share2 className="w-5 h-5 text-primary" />
            Share Payment Link
         </button>
         <button 
            onClick={() => router.push("/mobile/calculator")}
            className="w-full h-14 rounded-2xl text-muted-foreground/50 text-xs font-bold uppercase tracking-widest active:text-muted-foreground transition-all"
         >
            Cancel and Return
         </button>
      </div>
    </div>
  );
}
