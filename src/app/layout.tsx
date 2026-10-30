import type { Metadata, Viewport } from "next";
import { Geist, Inter, Rokkitt, Noto_Sans_JP, Oswald, Shippori_Mincho, Fraunces, Karla, Zen_Old_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/JsonLd";
import { PWARegister } from "@/components/PWARegister";
import { SeasonalFavicon } from "@/components/SeasonalLogo";

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
  // CJK wordt in ~70 subsets per gewicht gesliced; preload zou honderden
  // woff2-links per page-load geven (request-storm, okt 2026).
  preload: false,
});

const shipporiMincho = Shippori_Mincho({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

/* Story 2026 — Japanse cinema-paren voor de Over Ons-pagina */
const zenOldMincho = Zen_Old_Mincho({
  weight: ["400", "700", "900"],
  variable: "--font-zen-mincho",
  subsets: ["latin"], // CJK wordt door next/font automatisch gesliced
  display: "swap",
  preload: false,
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  weight: ["300", "400", "500"],
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#a90000',
};

export const metadata: Metadata = {
  metadataBase: new URL("https://judoclubmichigami.nl"),
  title: "Judo Steenbergen & Oud-Vossemeer | Judoclub Michigami",
  description:
    "Judoclub Michigami: judo in Steenbergen en Oud-Vossemeer voor kinderen vanaf 6 jaar, jongeren en volwassenen. 3 gratis proeflessen, lessen in Sportcentrum De Knotwilg en De Vossenkuil. Ook voor judo in Halsteren, Tholen en Bergen op Zoom.",
  keywords: [
    "judo Steenbergen",
    "judo Oud-Vossemeer",
    "judoles Steenbergen",
    "judoles Oud-Vossemeer",
    "judovereniging Steenbergen",
    "vechtsport Steenbergen",
    "vechtsport Oud-Vossemeer",
    "vechtsport Tholen",
    "sport Steenbergen",
    "sportvereniging Steenbergen",
    "judo lessen Halsteren",
    "judo lessen Kruisland",
    "judo lessen Dinteloord",
    "judo Bergen op Zoom",
    "judo Tholen",
    "judo Nieuw-Vossemeer",
    "judo De Heen",
    "judo Sint-Philipsland",
    "judo Oud-Gastel",
    "judo voor kinderen",
    "judo kinderen 6 jaar",
    "zelfverdediging Steenbergen",
    "proefles judo",
    "Michigami",
  ],
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
  openGraph: {
    title: "Judo Steenbergen & Oud-Vossemeer | Judoclub Michigami",
    description:
      "Judo voor kinderen vanaf 6 jaar, jongeren en volwassenen in Steenbergen en Oud-Vossemeer. 3 gratis proeflessen. Opgericht in 1993.",
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
        className={`${geistSans.variable} ${inter.variable} ${rokkitt.variable} ${oswald.variable} ${notoSansJp.variable} ${shipporiMincho.variable} ${fraunces.variable} ${karla.variable} ${zenOldMincho.variable} ${zenKakuGothic.variable} antialiased text-foreground`}
      >
        <SeasonalFavicon />
        <PWARegister />
        {children}
        <Toaster />
        <JsonLd />
      </body>
    </html>
  );
}
