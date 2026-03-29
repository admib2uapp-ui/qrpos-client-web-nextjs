"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Activity, Home, User, Settings } from "lucide-react";

const navItems = [
  { path: "/mobile/calculator", label: "Calculator", icon: Calculator },
  { path: "/mobile/activity", label: "Activity", icon: Activity },
  { path: "/summary", label: "Summary", icon: Home },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 md:hidden pointer-events-none transition-colors duration-300">
      <div className="flex items-center justify-around h-[min(18vw,72px)] px-[1vw] pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-[1.5vw] transition-all duration-300 ${
                active 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground/30 hover:text-foreground"
              }`}
            >
              <div className="relative">
                 <Icon className="w-[5.5vw] h-[5.5vw] max-w-[24px] max-h-[24px]" />
                 {active && <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-full" />}
              </div>
              <span className={`text-[2vw] sm:text-[8px] mt-[1vw] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}