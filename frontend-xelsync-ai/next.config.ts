import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://xelsync-api:8000/api/v1/:path*', // Proxy al backend en la misma red de Docker
      },
    ];
  },
};

export default nextConfig;
