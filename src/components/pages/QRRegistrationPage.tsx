"use client";

import { useState, useEffect } from "react";
import { TransactionForm, TransactionStatus } from "@/components/qr/QRRegistration";
import { MerchantPulseCard, LiveActivityFeed, MerchantMomentumCard } from "@/components/qr/QRRegistrationComponents";
import { generateQRData, initiateTransaction } from "@/lib/qrService";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useTransactions } from "@/hooks/useTransactions";

export default function QRRegistrationPage() {
  const { user } = useAuth();
  const { transactions, merchant, refresh } = useTransactions();
  const [currentTx, setCurrentTx] = useState<{ amount: string; ref: string } | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetKey, setResetKey] = useState(0);
  
  const { isSuccess } = useTransactionStatus(
    currentTx?.ref || null, 
    currentTx?.amount || "0",
    () => {
      // Dynamic Reset: Triggered when speech finishes
      setCurrentTx(null);
      setQrBase64(null);
      setResetKey(prev => prev + 1);
    }
  );
  
  // Immediately refresh transactions list when payment is verified
  useEffect(() => {
    if (isSuccess) {
      refresh();
    }
  }, [isSuccess, refresh]);

  const handleGenerate = async (amount: string, ref: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setQrBase64(null);

    try {
      // 1. Unified initiation (Saves to Supabase)
      const amountNum = parseFloat(amount);
      const transaction = await initiateTransaction(amountNum, ref || null, user.id);
      
      // Update the local transactions list immediately to show the "Pending" status
      refresh();

      // Update UI with the final reference
      setCurrentTx({ amount, ref: transaction.reference_no });

      // 2. QR Generation
      const { image, reference } = await generateQRData(amount, transaction, user.id);
      setQrBase64(image);
      if (reference && reference !== transaction.reference_no) {
        setCurrentTx((prev: any) => prev ? { ...prev, ref: reference } : null);
      }
    } catch (err: any) {
      console.error("Error generating QR:", err);
      setError(err.message || "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-700">
      
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <TransactionForm key={resetKey} onGenerate={handleGenerate} isLoading={isLoading} />
          <LiveActivityFeed transactions={transactions} />
        </div>
        
        <div className="w-full lg:w-[60%] flex flex-col gap-6">
            {currentTx ? (
              <TransactionStatus 
                amount={currentTx.amount} 
                ref={currentTx.ref} 
                qrBase64={qrBase64}
                loading={isLoading}
                error={error}
                isSuccess={isSuccess}
              />
            ) : (
              <div className="flex flex-col gap-6">
                <MerchantPulseCard transactions={transactions} />
                <MerchantMomentumCard transactions={transactions} />
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
