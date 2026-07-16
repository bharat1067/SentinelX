import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GlobalCommandPalette } from "@/components/common/GlobalCommandPalette";

export const metadata: Metadata = {
  title: "SentinelX — AI Powered Security Decision Intelligence Platform",
  description: "Detects privileged access misuse and insider threats inside banking environments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100 overflow-hidden h-screen w-screen">
        {children}
        <Toaster />
        <GlobalCommandPalette />
      </body>
    </html>
  );
}
