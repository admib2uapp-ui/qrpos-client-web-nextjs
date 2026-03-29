"use client";

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileHeader({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-sidebar-border/20 bg-background/80 px-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-foreground tracking-tight">B2U QR</span>
      </div>
      <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="rounded-full w-10 h-10 border border-sidebar-border/10 bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        {theme === "light" ? <Moon className="h-4 w-4 shrink-0" /> : <Sun className="h-4 w-4 shrink-0" />}
      </Button>
    </header>
  );
}
