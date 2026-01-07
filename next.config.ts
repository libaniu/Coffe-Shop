import type { NextConfig } from "next";

// HAPUS ": NextConfig" SETELAH NAMA VARIABEL
const nextConfig = { 
  /* config options here */
  typescript: {
    // Abaikan error TS saat build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Abaikan error ESLint saat build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;