"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useTransactionStatus(referenceNo: string | null, amount: string, onDoneSpeaking?: () => void) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  useEffect(() => {
    // Reset states when starting a new generation or clearing the current one
    if (!referenceNo) {
      setIsSuccess(false);
      setIsInitialCheckDone(false);
      return;
    }

    // 1. Initial check: Is it already completed?
    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('completed_transactions')
        .select('id')
        .eq('reference_no', referenceNo)
        .maybeSingle();
      
      if (data) {
        setIsSuccess(true);
      }
      setIsInitialCheckDone(true);
    };

    checkStatus();

    // 2. Real-time listener for "Success"
    // We listen for INSERT in completed_transactions
    const channel = supabase
      .channel(`comp-${referenceNo}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'completed_transactions',
        },
        (payload) => {
          // Robust comparison: check both raw value and padded value (for 16-digit numeric keys with leading zeros)
          const rawReceived = String(payload.new.reference_no);
          const paddedReceived = rawReceived.padStart(16, '0');
          
          if (rawReceived === referenceNo || paddedReceived === referenceNo) {
            setIsSuccess(true);
            // Trigger voice notification
            try {
              const speech = new SpeechSynthesisUtterance(`${amount} rupees received`);
              if (onDoneSpeaking) {
                speech.onend = () => {
                  // Adding a small 1s delay for better UX after speech finishes
                  setTimeout(onDoneSpeaking, 1000);
                };
              }
              window.speechSynthesis.speak(speech);
            } catch (e) {
              console.error("Speech error:", e);
              if (onDoneSpeaking) onDoneSpeaking();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenceNo, amount, onDoneSpeaking]);

  return { isSuccess, isInitialCheckDone };
}
