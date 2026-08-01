/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
