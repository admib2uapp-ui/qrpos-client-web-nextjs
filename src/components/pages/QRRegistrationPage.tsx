"use client";

import { useState } from "react";
import { TransactionForm, TransactionStatus } from "@/components/qr/QRRegistration";
import { generateQRData } from "@/lib/qrService";
import { useAuth } from "@/hooks/useAuth";

export default function QRRegistrationPage() {
  const { user } = useAuth();
  const [currentTx, setCurrentTx] = useState<{ amount: string; ref: string } | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (amount: string, ref: string) => {
    if (!user) return;
    
    setCurrentTx({ amount, ref });
    setIsLoading(true);
    setError(null);
    setQrBase64(null);

    try {
      // Use the actual reference passed, or it will generate one in the service
      const base64 = await generateQRData(amount, ref, user.id);
      setQrBase64(base64);
    } catch (err: any) {
      console.error("Error generating QR:", err);
      setError(err.message || "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <TransactionForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="w-full lg:w-1/2 lg:sticky lg:top-8">
            {currentTx ? (
              <TransactionStatus 
                amount={currentTx.amount} 
                ref={currentTx.ref} 
                qrBase64={qrBase64}
                loading={isLoading}
                error={error}
              />
            ) : (
              <div className="border border-dashed border-sidebar-border/50 rounded-xl h-[400px] flex items-center justify-center text-muted-foreground bg-sidebar/5">
                Generate a QR to see details here
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
