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

    // 1. Core check function (Initial check + Polling fallback)
    const checkStatus = async () => {
      if (isSuccess) return; // Already succeeded
      
      const { data } = await supabase
        .from('completed_transactions')
        .select('id')
        .eq('reference_no', referenceNo)
        .maybeSingle();
      
      if (data) {
        handleSuccess();
      }
      setIsInitialCheckDone(true);
    };

    const handleSuccess = () => {
      setIsSuccess(true);
      // Trigger voice notification
      try {
        const speech = new SpeechSynthesisUtterance(`${amount} rupees received`);
        if (onDoneSpeaking) {
          speech.onend = () => {
            setTimeout(onDoneSpeaking, 1000);
          };
        }
        window.speechSynthesis.speak(speech);
      } catch (e) {
        console.error("Speech error:", e);
        if (onDoneSpeaking) onDoneSpeaking();
      }
    };

    // 2. Immediate check
    checkStatus();

    // 3. Robust Polling Fallback (Every 2 seconds as a safety net)
    const pollInterval = setInterval(checkStatus, 2000);

    // 4. Real-time listener for "Instant" Success
    const channel = supabase
      .channel(`comp-${referenceNo}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'completed_transactions',
        },
        (payload) => {
          if (isSuccess) return;
          
          const rawReceived = String(payload.new.reference_no);
          const paddedReceived = rawReceived.padStart(16, '0');
          
          if (rawReceived === referenceNo || paddedReceived === referenceNo) {
            handleSuccess();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [referenceNo, amount, onDoneSpeaking, isSuccess]);

  return { isSuccess, isInitialCheckDone };
}
