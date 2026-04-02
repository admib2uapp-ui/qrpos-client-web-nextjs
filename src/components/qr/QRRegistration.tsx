"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { QrCode, Clipboard, Download, Share2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export function TransactionForm({ onGenerate, isLoading }: { onGenerate: (amount: string, ref: string) => void; isLoading?: boolean }) {
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount) onGenerate(amount, ref);
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle>Generate QR</CardTitle>
        <CardDescription>Enter amount to generate a static or dynamic QR code.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (LKR)</Label>
            <Input 
              id="amount" 
              placeholder="0.00" 
              type="number" 
              step="0.01" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-black h-14 border-primary/20 bg-primary/5 focus-visible:ring-primary/30 transition-all text-primary no-spinner" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ref">Invoice Number (Optional)</Label>
            <Input 
              id="ref" 
              placeholder="e.g. INV-100" 
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="h-14 border-primary/10 bg-primary/5 focus-visible:ring-primary/20 transition-all"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-10 text-lg font-black gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
            Generate LankaQR
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TransactionStatus({ 
  amount, 
  ref, 
  qrBase64, 
  loading, 
  error,
  isSuccess 
}: { 
  amount: string; 
  ref: string; 
  qrBase64: string | null;
  loading: boolean;
  error: string | null;
  isSuccess?: boolean;
}) {
  const getQrSrc = (base64: string) => {
    if (base64.startsWith("data:")) return base64;
    return `data:image/png;base64,${base64}`;
  };

  if (isSuccess) {
    return (
      <Card className="glass-card animate-in zoom-in duration-1000 overflow-hidden relative border-emerald-500/30 bg-emerald-500/5 h-full min-h-[600px] flex flex-col items-center justify-center p-8 text-center space-y-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
          <div className="relative w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)] transform transition-transform group-hover:scale-110 duration-700">
            <CheckCircle2 className="w-16 h-16 text-white animate-in zoom-in spin-in-180 duration-1000" />
          </div>
          <div className="absolute -inset-4 border-2 border-emerald-500/20 rounded-full animate-[ping_3s_infinite]" />
        </div>

        <div className="space-y-4 relative">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Success</h2>
            <p className="text-xs font-bold text-emerald-500/80 uppercase tracking-[0.3em]">Payment Received</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">Total Amount</p>
            <div className="text-5xl font-black text-emerald-500 tracking-tighter flex items-baseline justify-center gap-1">
              <span className="text-2xl opacity-70">LKR</span>
              {parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-500/10">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Invoice Reference</p>
            <p className="text-sm font-black text-foreground/80 tracking-widest">{ref}</p>
          </div>
        </div>

        <div className="w-full pt-4 relative">
          <Button 
            className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.4)] active:scale-95 transition-all rounded-2xl"
            onClick={() => window.location.reload()}
          >
            New Transaction
          </Button>
          <p className="mt-4 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Securely Verified by PeoplesBank</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card animate-in slide-in-from-right-8 duration-700 overflow-hidden relative border-primary/10 h-full">
      <CardContent className="p-2 flex flex-col items-center text-center h-full">
        <div className="relative overflow-hidden rounded-[2rem] flex items-center justify-center h-full py-4 w-full bg-slate-950/5 dark:bg-slate-950/40 border border-primary/5 p-0">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Generating Secure QR...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-destructive p-8">
              <AlertCircle className="w-16 h-16" />
              <p className="text-sm font-bold text-center">{error}</p>
            </div>
          ) : qrBase64 ? (
            <div className="relative w-fit mx-auto flex flex-col items-center gap-6">
              <img 
                src={getQrSrc(qrBase64!)} 
                alt="LankaQR" 
                className="w-full h-auto aspect-square object-contain rounded-[2rem] shadow-2xl transition-transform hover:scale-[1.02]"
              />

            </div>
            
          ) : (
             <div className="w-full aspect-square flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-primary/10 bg-primary/5">
                <QrCode className="w-32 h-32 text-primary/20" />
                <p className="mt-4 text-sm font-bold text-primary/30 uppercase tracking-widest">QR Display Area</p>
             </div>
          )}
        </div>

        
      </CardContent>
    </Card>
  );
}
