import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Add webpack configuration to handle JSON imports
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'javascript/auto',
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

export default nextConfig;
