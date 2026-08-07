import type { Metadata, Viewport } from "next";
import { Geist, Inter, Rokkitt, Noto_Sans_JP, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/JsonLd";
import { PWARegister } from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const rokkitt = Rokkitt({
  weight: ["400", "500", "600", "700"],
  variable: "--font-rokkitt",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Judoclub Michigami Steenbergen - Judo voor Jong en Oud",
  description: "Judo voor jong en oud, voor beginners en gevorderden - recreatief of prestatiegericht. Judoclub Michigami Steenbergen, opgericht in 1993.",
  keywords: ["Judo", "Judoclub", "Michigami", "Steenbergen", "Sport", "Judovereniging", "Vechtsport", "Kawaishi", "Kodokan", "judo lessen Steenbergen", "judo training Zeeland"],
  authors: [{ name: "Judoclub Michigami" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192x192.png", sizes: "192x192" },
      { url: "/icon-512x512.png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Michigami",
    statusBarStyle: "default",
  },
  themeColor: "#a90000",
  openGraph: {
    title: "Judoclub Michigami Steenbergen - Judo voor Jong en Oud",
    description: "Judo voor jong en oud, voor beginners en gevorderden - recreatief of prestatiegericht. Opgericht in 1993.",
    url: "https://judoclubmichigami.nl",
    siteName: "Judoclub Michigami Steenbergen",
    type: "website",
    locale: "nl_NL",
    images: [
      {
        url: "https://judoclubmichigami.nl/logo.png",
        width: 1200,
        height: 630,
        alt: "Judoclub Michigami Steenbergen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Judoclub Michigami Steenbergen - Judo voor Jong en Oud",
    description: "Judo voor jong en oud, voor beginners en gevorderden - recreatief of prestatiegericht.",
    images: ["https://judoclubmichigami.nl/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        className={`${geistSans.variable} ${inter.variable} ${rokkitt.variable} ${oswald.variable} ${notoSansJp.variable} antialiased bg-background text-foreground`}
      >
        <PWARegister />
        {children}
        <Toaster />
        <JsonLd />
      </body>
    </html>
  );
}
