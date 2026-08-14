import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['large-phones-watch.loca.lt', 'petite-beds-clean.loca.lt', 'localhost', '127.0.0.1'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
};

export default nextConfig;
