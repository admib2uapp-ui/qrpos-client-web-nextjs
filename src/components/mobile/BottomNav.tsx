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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}