import type { NextConfig } from "next";
import path from "path";

const dbDialect = process.env.DB_DIALECT ?? "sqlite";
const schemaFile = dbDialect === "postgres" ? "schema.pg" : "schema.sqlite";

const nextConfig: NextConfig = {
  /* config options here */
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
  // Turbopack configuration (used in dev and default builds in Next.js 16+)
  turbopack: {
    resolveAlias: {
      "@/lib/db/schema": `./lib/db/${schemaFile}`,
    },
  },
  // Webpack configuration (used when building with --webpack flag)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/lib/db/schema": path.resolve(__dirname, `lib/db/${schemaFile}.ts`),
    };

    return config;
  },
};

export default nextConfig;
