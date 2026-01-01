import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "443",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "443",
      },
    ],
  },
};

export default nextConfig;
