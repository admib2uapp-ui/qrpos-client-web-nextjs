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
    <Card>
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
              className="text-xl font-bold h-12 border-sidebar-border/50 bg-sidebar/10" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ref">Reference Number (Optional)</Label>
            <Input 
              id="ref" 
              placeholder="e.g. INV-100" 
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="h-12 border-sidebar-border/50 bg-sidebar/10"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold gap-2 shadow-lg hover:shadow-primary/20 transition-all"
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
      <Card className="p-8 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500 bg-green-50/30 border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-green-700">Payment Received</h2>
          <p className="text-muted-foreground text-lg">LKR {parseFloat(amount).toFixed(2)}</p>
          <p className="text-xs font-mono text-muted-foreground/60">{ref}</p>
        </div>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => window.location.reload()}
        >
          New Transaction
        </Button>
      </Card>
    );
  }

  return (
    <Card className="animate-in zoom-in-95 duration-500">
      <CardContent className="pt-6 flex flex-col items-center text-center space-y-6">
        <div className="relative p-6 bg-white rounded-2xl shadow-inner border border-sidebar-border/10 min-h-[220px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Generating QR...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="w-12 h-12" />
              <p className="text-xs">{error}</p>
            </div>
          ) : qrBase64 ? (
            <>
              <img 
                src={getQrSrc(qrBase64)} 
                alt="LankaQR" 
                className="w-[180px] h-[180px] animate-in fade-in duration-500"
              />
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </>
          ) : (
             <div className="w-[180px] h-[180px] bg-slate-100 dark:bg-slate-200 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                <QrCode className="w-24 h-24 text-slate-400" />
             </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-primary">LKR {parseFloat(amount).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground font-mono">{ref || "No Reference"}</p>
          {qrBase64 && (
            <p className="text-[10px] text-muted-foreground/50 font-mono truncate max-w-[200px]">
              Debug: {qrBase64.substring(0, 100)}...
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="outline" disabled={!qrBase64} className="gap-2 h-11 border-sidebar-border/50 bg-sidebar/10">
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button variant="outline" disabled={!qrBase64} className="gap-2 h-11 border-sidebar-border/50 bg-sidebar/10">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="outline" disabled={!qrBase64} className="gap-2 h-11 col-span-2 border-sidebar-border/50 bg-sidebar/10">
            <Clipboard className="w-4 h-4" /> Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
