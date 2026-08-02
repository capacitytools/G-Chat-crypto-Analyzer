import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "G-Chat Crypto Analyzer",
  description: "AI-powered crypto market analyzer — Binance data, WhatsApp-clean UI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "G-Chat Crypto",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B141A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-appbg text-textPrimary font-sans min-h-screen antialiased">
        <div className="mx-auto max-w-lg min-h-screen flex flex-col relative">
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
