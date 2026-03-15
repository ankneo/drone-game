import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true, // Required for static export
  },
  output: 'export',
  basePath: '/drone-game', // Matches your GitHub repository name
  transpilePackages: ['motion'],
};

export default nextConfig;
