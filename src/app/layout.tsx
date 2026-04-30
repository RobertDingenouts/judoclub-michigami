import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Judoclub Michigami Steenbergen - Exameneisen & Agenda",
  description: "Officiële website van Judoclub Michigami Steenbergen. Exameneisen, agenda, technieken en informatie over onze judo club.",
  keywords: ["judo", "michigami", "steenbergen", "exameneisen", "judoclub", "kawaishi"],
  authors: [{ name: "Judoclub Michigami" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Simple Navigation Header */}
        <header className="bg-[#8B0000] text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="JC Michigami" className="h-10 w-10" />
              <div>
                <h1 className="text-lg font-bold">Judoclub Michigami</h1>
                <p className="text-xs text-yellow-300">Steenbergen</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="hover:text-yellow-300 transition-colors font-medium">
                🏠 Home
              </Link>
              <Link href="/#agenda" className="hover:text-yellow-300 transition-colors font-medium">
                📅 Agenda
              </Link>
              <Link href="/#technieken" className="hover:text-yellow-300 transition-colors font-medium">
                🥋 Technieken
              </Link>
              <Link href="/#examen" className="hover:text-yellow-300 transition-colors font-medium">
                🎯 Examens
              </Link>
              <Link href="/#contact" className="hover:text-yellow-300 transition-colors font-medium">
                ✉️ Contact
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <Toaster />
      </body>
    </html>
  );
}
