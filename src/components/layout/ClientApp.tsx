"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BottomNav } from "@/components/mobile/BottomNav";
import { AppSidebar } from "@/components/layout/AppSidebar"; // I will create this
import { MobileHeader } from "@/components/layout/MobileHeader"; // I will create this
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { SignIn } from "@/components/auth/SignIn";
import { MobileSignIn } from "@/components/auth/MobileSignIn";

export function ClientApp({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Initializing B2U QR...</p>
      </div>
    );
  }

  const isAuthPage = pathname.includes("signin") || pathname.includes("signup") || pathname.includes("forgot-password");

  if (!user && !isAuthPage) {
    // We would normally redirect here, but for now we'll show the sign in
    return isMobile ? <MobileSignIn /> : <SignIn />;
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <MobileHeader theme={theme} toggleTheme={toggleTheme} />
        <div className="flex-1 overflow-y-auto pb-20 pt-14">
          {children}
        </div>
        {!isAuthPage && <BottomNav />}
      </div>
    );
  }

  return (
    <SidebarProvider className="app-shell sidebar-glass">
      <AppSidebar theme={theme} toggleTheme={toggleTheme} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </SidebarProvider>
  );
}
