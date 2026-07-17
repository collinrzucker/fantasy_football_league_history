import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TabNav } from "@/components/TabNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game of (Red) Zones — League History",
  description: "Records, championship history, and draft history for the Game of (Red) Zones fantasy football league.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-page text-text-primary">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-5">
            <h1 className="text-lg font-semibold tracking-tight">
              Game of (Red) Zones
            </h1>
            <p className="text-sm text-text-muted">League history since 2012</p>
          </div>
        </header>
        <TabNav />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
