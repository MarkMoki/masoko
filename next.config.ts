import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: process.env.CAPACITOR === "true",
  },
};

export default nextConfig;
