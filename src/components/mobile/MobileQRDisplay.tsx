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
  const [isShared, setIsShared] = useState(false);
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
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  const handleCancel = () => {
    router.push("/mobile/calculator");
  };

  const handleShare = () => {
    setIsShared(true);
  };

  const handleDone = () => {
    router.push("/mobile/calculator");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Actions */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={handleCancel}
          className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm shadow-md flex items-center justify-center border border-border/50"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
            {isGenerating ? "Generating..." : "Waiting for payment"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* QR Code Container */}
        <div className="relative mb-8">
          <div className="w-64 h-64 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-6 border-4 border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Generating...</p>
              </div>
            ) : isSuccess ? (
              <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                </div>
                <p className="text-xl font-black text-emerald-600 uppercase tracking-tight">Confirmed!</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 text-destructive px-4 text-center">
                <AlertCircle className="w-12 h-12" />
                <p className="text-xs font-bold">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-[10px] uppercase underline font-black"
                >
                  Retry
                </button>
              </div>
            ) : qrBase64 ? (
              <img 
                src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`} 
                alt="Payment QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-slate-50/50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
            )}
          </div>
          {/* Glow effect */}
          {!error && (
            <div className="absolute -inset-6 bg-primary opacity-20 rounded-[3rem] -z-10 blur-2xl animate-pulse" />
          )}
        </div>

        {/* Reference Number */}
        <div className="text-center mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 opacity-70 font-bold">Reference Number</p>
          <p className="text-xl font-black text-foreground font-mono tracking-tight bg-secondary/30 px-4 py-1.5 rounded-lg border border-border/50 shadow-inner">
            {refNo || "REF-000000"}
          </p>
        </div>

        {/* Amount Display */}
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium italic">Total Request Amount</p>
          <p className="text-5xl font-black text-foreground tracking-tighter flex items-baseline justify-center gap-1">
            <span className="text-lg font-bold text-primary opacity-80">LKR</span>
            {formatAmount(amount)}
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 pb-24">
        {!isShared ? (
          <>
            <button
              onClick={handleShare}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold shadow-lg flex items-center justify-center gap-2 mb-3"
            >
              <Share2 className="w-5 h-5" />
              Share QR Code
            </button>
            <button
              onClick={handleCancel}
              className="w-full h-12 rounded-xl bg-card border border-border/50 text-muted-foreground font-semibold flex items-center justify-center gap-2 active:bg-secondary/50 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel Transaction
            </button>
          </>
        ) : (
          <button
            onClick={handleDone}
            className="w-full h-12 rounded-xl bg-emerald-500 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Done
          </button>
        )}
      </div>
    </div>
  );
}
