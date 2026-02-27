/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid flaky filesystem cache writes in local dev.
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

module.exports = nextConfig;
