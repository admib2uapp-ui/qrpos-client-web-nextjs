"use client";

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileHeader({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between bg-background/80 backdrop-blur-xl px-6 border-b border-border/40 md:hidden pointer-events-none transition-colors duration-300">
      <div className="flex items-center gap-2">
        <span className="font-black text-xs uppercase tracking-[0.3em] text-foreground/40">B2U Terminal</span>
      </div>
      <div className="pointer-events-auto">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full w-9 h-9 border border-border/50 bg-secondary/80 hover:bg-secondary transition-all shadow-sm active:scale-95"
        >
          {theme === "light" ? <Moon className="h-4 w-4 text-foreground/70" /> : <Sun className="h-4 w-4 text-foreground/70" />}
        </Button>
      </div>
    </header>
  );
}
