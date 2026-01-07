import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hapus bagian eslint yang tadi bikin error merah
};

export default nextConfig;