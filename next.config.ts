import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize production build
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Enable production optimizations
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Disable powered by header
  poweredByHeader: false,

  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default nextConfig;
