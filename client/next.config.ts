import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['large-phones-watch.loca.lt', 'petite-beds-clean.loca.lt', 'localhost', '127.0.0.1'],
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: ['pdfkit']
};

export default nextConfig;
