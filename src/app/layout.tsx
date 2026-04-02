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
  title: "QR POS Terminal",
  description: "High-speed mobile POS and LankaQR aggregator terminal",
  manifest: "/manifest.json",
  themeColor: "#34b4ea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QR POS",
  },
  icons: {
    icon: [
      { url: "/logo.jpeg" },
      { url: "/logo.jpeg", sizes: "32x32", type: "image/jpeg" },
    ],
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <ClientApp>{children}</ClientApp>
        </AuthProvider>
      </body>
    </html>
  );
}
