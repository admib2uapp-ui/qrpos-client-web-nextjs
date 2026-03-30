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
  const txId = searchParams.get("id") || "";
  const [transaction, setTransaction] = useState<any>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const amount = searchParams.get("amount") || "0";

  // Use the reference from the transaction object for status checking
  const { isSuccess } = useTransactionStatus(transaction?.reference_no || "", amount);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/mobile/calculator");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  // 1. Fetch transaction details
  useEffect(() => {
    if (!txId) return;
    const fetchTx = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', txId)
        .single();
      
      if (error) {
        console.error('Error fetching transaction:', error);
        setError('Transaction not found');
        return;
      }
      setTransaction(data);
    };
    fetchTx();
  }, [txId]);

  // 2. Generate QR once transaction is loaded
  useEffect(() => {
    if (!user || !transaction) return;
    const fetchQR = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const { image, reference } = await generateQRData(amount, transaction, user.id);
        setQrBase64(image);
        if (reference && reference !== transaction.reference_no) {
          setTransaction((prev: any) => prev ? { ...prev, reference_no: reference } : null);
        }
      } catch (err: any) {
        console.error('Failed to generate QR:', err);
        setError(err.message || 'Failed to generate QR code');
      } finally {
        setIsGenerating(false);
      }
    };
    fetchQR();
  }, [user, amount, transaction]);

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00";
    const parts = num.toFixed(2).split(".");
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${parts[1]}`;
  };

  const svgToPng = (svgData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgUrl = svgData.startsWith('data:') ? svgData : `data:image/svg+xml;base64,${btoa(svgData)}`;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Increase resolution for better quality
        const scale = 4;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load SVG for conversion'));
      img.src = svgUrl;
    });
  };

  const handleDownload = async () => {
    if (!qrBase64) return;
    try {
      // Check if it's an SVG and convert if necessary
      const isSvg = qrBase64.includes('<svg') || qrBase64.includes('image/svg+xml');
      const dataUrl = isSvg ? await svgToPng(qrBase64) : (qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `LankaQR_${transaction?.reference_no || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to save image. Please try taking a screenshot.');
    }
  };

  const handleShare = async () => {
    if (!qrBase64) return;
    try {
      const isSvg = qrBase64.includes('<svg') || qrBase64.includes('image/svg+xml');
      const dataUrl = isSvg ? await svgToPng(qrBase64) : (qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`);
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `LankaQR_${transaction?.reference_no || 'Payment'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Robust feature detection for file sharing
      const canShareFiles = typeof navigator !== 'undefined' && 
                          typeof navigator.canShare === 'function' && 
                          navigator.canShare({ files: [file] });

      if (canShareFiles && typeof navigator.share === 'function') {
        await navigator.share({
          files: [file],
          title: 'LankaQR Payment',
          text: `Scan to pay LKR ${formatAmount(amount)}`,
        });
      } else if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        // Fallback to text/url if file sharing not possible
        await navigator.share({
          title: 'LankaQR Payment',
          text: `Scan to pay LKR ${formatAmount(amount)} (Ref: ${transaction?.reference_no || 'N/A'})`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Payment link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      // Final fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
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

      {/* Main Content - Maximized QR View */}
      <div className="flex-1 flex flex-col items-center justify-start pt-[2vh] px-[5vw] z-10 overflow-y-auto">
        
        {/* QR Card - Full Width / Optimized Aspect */}
        <div className="relative group w-full flex justify-center">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-emerald-500/20 rounded-[10vw] blur-3xl opacity-30 animate-pulse" />
          
          <div className="w-[88vw] min-h-[110vw] bg-white rounded-[6vw] shadow-2xl flex items-center justify-center p-[4vw] border-4 border-black/5 relative overflow-hidden transition-all duration-500">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-[4vw]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[3vw] sm:text-xs font-black text-black/20 uppercase tracking-[0.2em]">Encrypting QR...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-[4vw] text-destructive text-center p-[6vw]">
                <AlertCircle className="w-12 h-12" />
                <p className="text-[3.5vw] sm:text-sm font-bold">{error}</p>
                <button onClick={() => window.location.reload()} className="px-[6vw] py-[2vw] bg-destructive/10 rounded-full text-[2.5vw] sm:text-[10px] uppercase font-black">Retry</button>
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

        <p className="mt-[3vh] text-[2.5vw] sm:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] animate-pulse">
          Scan to Complete Payment
        </p>
      </div>

      {/* Footer Actions - Native Mobile Suite */}
      <div className="p-[6vw] pb-12 flex flex-col gap-[3.5vw] z-10 bg-background/80 backdrop-blur-xl border-t border-border/10">
         <div className="flex gap-[3.5vw]">
            <button 
              onClick={handleShare}
              disabled={!qrBase64}
              className="flex-1 h-[8vh] min-h-[64px] rounded-[5vw] bg-primary text-primary-foreground flex flex-col items-center justify-center gap-[1vw] font-bold active:scale-95 transition-all shadow-xl shadow-primary/20 text-[3.2vw] sm:text-xs disabled:opacity-50"
            >
               <Share2 className="w-[5vw] h-[5vw]" />
               SHARE
            </button>
            <button 
              onClick={handleDownload}
              disabled={!qrBase64}
              className="flex-1 h-[8vh] min-h-[64px] rounded-[5vw] bg-secondary border-2 border-border/40 flex flex-col items-center justify-center gap-[1vw] font-bold active:bg-secondary/80 active:scale-95 transition-all shadow-sm text-[3.2vw] sm:text-xs disabled:opacity-50"
            >
               <Check className="w-[5vw] h-[5vw] text-emerald-500" />
               SAVE QR
            </button>
         </div>

         <button 
            onClick={() => router.push("/mobile/calculator")}
            className="w-full py-[2vh] text-muted-foreground/30 text-[3vw] sm:text-[10px] font-bold uppercase tracking-[0.4em] active:text-muted-foreground transition-all flex items-center justify-center gap-[2vw]"
         >
            <X className="w-3 h-3" /> Done / New Sale
         </button>
      </div>
    </div>
  );
}
