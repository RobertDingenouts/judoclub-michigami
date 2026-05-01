import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Judoclub Michigami Steenbergen",
  description: "Judo voor jong en oud, voor beginners en gevorderden - recreatief of prestatiegericht. Judoclub Michigami Steenbergen, opgericht in 1993.",
  keywords: ["Judo", "Judoclub", "Michigami", "Steenbergen", "Sport", "Judovereniging", "Vechtsport", "Kawaishi", "Kodokan"],
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
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
