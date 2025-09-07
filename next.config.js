const withPWA = require("next-pwa")({
  dest: "public",                // where service worker & manifest are generated
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // disable in dev
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/offline.html",   // fallback page when offline
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "i.ytimg.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  experimental: {
    esmExternals: false,
  },
});

module.exports = nextConfig;
