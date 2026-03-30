"use client";

import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { Home, Settings, User, Layout, QrCode, LogOut, Moon, Sun } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

function SidebarBrand({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-3 group-data-[collapsible=icon]:px-0">
      <div className="group/logo relative flex flex-1 items-center justify-center gap-2 transition-all duration-200 cursor-pointer group-data-[collapsible=icon]:cursor-default">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity duration-150 group-data-[collapsible=icon]:group-hover/logo:opacity-0">
           <QrCode className="h-5 w-5" />
        </div>
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-bold text-sidebar-foreground">{title}</span>
          <span className="text-xs text-sidebar-foreground/60">Next.js Portal</span>
        </div>
        <SidebarTrigger className="absolute inset-0 hidden items-center justify-center rounded-md opacity-0 pointer-events-none transition-opacity duration-150 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:group-hover/logo:opacity-100 group-data-[collapsible=icon]:group-hover/logo:pointer-events-auto" />
      </div>
      <div className="shrink-0 group-data-[collapsible=icon]:hidden">
        <SidebarTrigger />
      </div>
    </div>
  );
}

export function AppSidebar({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" className="sidebar-glass">
      <SidebarHeader className="border-b border-sidebar-border/50 py-4">
        <SidebarBrand title="QR POS" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="QR Registration">
                  <Link href="/">
                    <QrCode className="h-4 w-4" />
                    <span>QR Registration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/transactions'} tooltip="Transactions">
                  <Link href="/transactions">
                    <Layout className="h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/summary'} tooltip="Summary">
                  <Link href="/summary">
                    <Home className="h-4 w-4" />
                    <span>Summary</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4 my-2 opacity-50 bg-sidebar-border font-bold h-[2px]" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/profile'} tooltip="Profile">
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Sign Out">
                  <button onClick={() => signOut()} className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t border-sidebar-border/50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleTheme} 
          className="w-full justify-start gap-2"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </Button>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
