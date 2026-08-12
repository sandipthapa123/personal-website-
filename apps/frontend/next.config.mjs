/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    cpus: 1,
  },
  transpilePackages: [
    '@cms/shared-types',
    '@cms/ui-contracts',
    '@cms/validation',
    '@cms/constants',
    '@cms/design-tokens',
    '@cms/accessibility',
    '@cms/api-client',
    '@cms/utilities'
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api.thapasandip.com.np',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;

