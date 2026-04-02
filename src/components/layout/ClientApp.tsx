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
import { InstallPWA } from "@/components/pwa/InstallPWA";

export function ClientApp({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

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
        <p className="text-sm text-muted-foreground animate-pulse">Initializing QR POS...</p>
      </div>
    );
  }

  const isAuthPage = pathname.includes("signin") || pathname.includes("signup") || pathname.includes("forgot-password");

  if (!user && !isAuthPage) {
    // We would normally redirect here, but for now we'll show the sign in
    return isMobile ? <MobileSignIn /> : <SignIn />;
  }

  if (isMobile) {
    const isPremiumPage = pathname.includes("/mobile/calculator") || pathname.includes("/mobile/qr");
    return (
      <div className={`h-screen flex flex-col transition-colors duration-300 bg-background`}>
        <InstallPWA />
        <MobileHeader theme={theme} toggleTheme={toggleTheme} />
        <main className={`flex-1 overflow-hidden h-full pt-[min(15vw,60px)] ${isPremiumPage ? "" : "pb-[min(18vw,72px)] overflow-y-auto"}`}>
          {children}
        </main>
        {!isAuthPage && <BottomNav />}
      </div>
    );
  }

  return (
    <div className="relative h-screen flex overflow-hidden bg-background/50">
      {/* Premium Desktop Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-40 dark:opacity-70">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-primary/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[-15%] w-[55%] h-[55%] bg-emerald-600/10 rounded-full blur-[160px] animate-pulse [animation-delay:2s]" />
      </div>

      <SidebarProvider className="app-shell sidebar-glass">
        <InstallPWA />
        <AppSidebar theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-auto relative z-10 backdrop-blur-[2px]">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
