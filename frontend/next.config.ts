import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.test.com',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
      {
        protocol: 'https',
        hostname: 'w8vhrfsrvi4fuino.public.blob.vercel-storage.com',
      },
      // Solana dApp domains
      {
        protocol: 'https',
        hostname: 'phantom.app',
      },
      {
        protocol: 'https',
        hostname: 'magiceden.io',
      },
      {
        protocol: 'https',
        hostname: 'jup.ag',
      },
      {
        protocol: 'https',
        hostname: 'raydium.io',
      },
      {
        protocol: 'https',
        hostname: 'www.orca.so',
      },
      {
        protocol: 'https',
        hostname: 'orca.so',
      },
      {
        protocol: 'https',
        hostname: 'solscan.io',
      },
      {
        protocol: 'https',
        hostname: 'www.metaplex.com',
      },
      {
        protocol: 'https',
        hostname: 'metaplex.com',
      },
      {
        protocol: 'https',
        hostname: 'pyth.network',
      },
      {
        protocol: 'https',
        hostname: 'www.helium.com',
      },
      {
        protocol: 'https',
        hostname: 'helium.com',
      },
      {
        protocol: 'https',
        hostname: 'www.drift.trade',
      },
      {
        protocol: 'https',
        hostname: 'drift.trade',
      },
      {
        protocol: 'https',
        hostname: 'solend.fi',
      },
      {
        protocol: 'https',
        hostname: 'solana.fm',
      },
      // GitHub domains for organization avatars
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // Clearbit logo service
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      // Simple Icons CDN
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
      // Google Favicon service
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
  },
};

export default nextConfig;
