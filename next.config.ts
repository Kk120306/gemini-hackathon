import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "kais-mac-mini.tail4a140f.ts.net"],
  experimental: {
    serverActions: {
      allowedOrigins: ["kais-mac-mini.tail4a140f.ts.net"],
      bodySizeLimit: "14mb",
    },
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
