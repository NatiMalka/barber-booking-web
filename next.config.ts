import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: [
    'firebase',
    '@firebase/app',
    '@firebase/firestore',
    '@firebase/auth',
    '@firebase/storage',
    '@firebase/functions',
    '@firebase/database',
    '@firebase/remote-config',
    '@firebase/performance',
    '@firebase/analytics',
    '@firebase/messaging',
    '@grpc/grpc-js',
    'protobufjs'
  ],
  // Add webpack configuration to handle JSON imports
  webpack: (config) => {
    // Add rule for JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'javascript/auto',
      loader: 'json-loader',
      resolve: {
        fullySpecified: false
      }
    });

    // Add node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Exclude problematic packages from client bundle
    config.externals = [
      ...(config.externals || []),
      { 'utf-8-validate': 'commonjs utf-8-validate' },
      { 'bufferutil': 'commonjs bufferutil' },
    ];

    return config;
  },
};

export default nextConfig;
