"use client";

import QRRegistrationPage from "@/components/pages/QRRegistrationPage";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileAmountInput } from "@/components/mobile/MobileAmountInput";
import { useState, useEffect } from "react";

export default function Home() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return <MobileAmountInput />;
  }

  return <QRRegistrationPage />;
}
