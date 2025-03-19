/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  trailingSlash: true,
  // Add rewrites for direct navigation
  async rewrites() {
    return [
      {
        source: '/client/booking',
        destination: '/client/booking/index.html',
      },
    ];
  }
}

module.exports = nextConfig 