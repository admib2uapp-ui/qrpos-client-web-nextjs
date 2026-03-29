"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useTransactionStatus(referenceNo: string | null, amount: string) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!referenceNo) return;

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
          filter: `reference_no=eq.${referenceNo}`
        },
        (payload) => {
          setIsSuccess(true);
          // Trigger voice notification
          try {
            const speech = new SpeechSynthesisUtterance(`${amount} rupees received`);
            window.speechSynthesis.speak(speech);
          } catch (e) {
            console.error("Speech error:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenceNo, amount]);

  return { isSuccess, isInitialCheckDone };
}
