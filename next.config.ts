import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
