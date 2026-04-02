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
      <Card className="glass-card p-10 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-700 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-[30px] opacity-20 animate-pulse" />
          <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-14 h-14 text-white animate-in zoom-in spin-in-90 duration-500" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Payment Received</h2>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-xl">
            LKR {parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm font-bold text-muted-foreground/60 tracking-wider uppercase">{ref}</p>
        </div>
        <Button 
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          onClick={() => window.location.reload()}
        >
          New Transaction
        </Button>
      </Card>
    );
  }

  return (
    <Card className="glass-card animate-in slide-in-from-right-8 duration-700 overflow-hidden relative border-primary/10">
      <CardContent className="p-2 flex flex-col items-center text-center">
        <div className="relative overflow-hidden rounded-[2rem] flex items-center justify-center min-h-[600px] py-4 w-full bg-slate-950/5 dark:bg-slate-950/40 border border-primary/5 p-0">
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
