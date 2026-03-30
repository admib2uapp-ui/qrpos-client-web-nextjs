import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ClientApp } from "@/components/layout/ClientApp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B2U QR POS Terminal",
  description: "High-speed mobile POS and LankaQR aggregator terminal",
  manifest: "/manifest.json",
  themeColor: "#34b4ea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "B2U POS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <ClientApp>{children}</ClientApp>
        </AuthProvider>
      </body>
    </html>
  );
}
