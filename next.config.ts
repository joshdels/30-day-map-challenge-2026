import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript is checked explicitly by the Vercel build command before this
  // compilation step. Keeping it separate avoids duplicate compiler startup.
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.build.json",
  },
};

export default nextConfig;
