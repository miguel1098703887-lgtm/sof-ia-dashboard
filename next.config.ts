import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/sof-ia-dashboard',
  assetPrefix: '/sof-ia-dashboard',
};

export default nextConfig;
