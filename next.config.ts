import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: "standalone",

  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // TypeScript: fail build on errors (catch issues early)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize package imports - tree-shake unused exports
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-tabs",
      "@radix-ui/react-accordion",
    ],
  },

  // Image optimization: support AVIF and WebP formats
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Caching headers for static assets
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [];
  },

  // Rewrites (if needed)
  async rewrites() {
    return [];
  },
};

export default withBundleAnalyzer(nextConfig);
