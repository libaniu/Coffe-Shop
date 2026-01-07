import type { NextConfig } from "next";

// Hapus ": NextConfig" di baris ini
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;