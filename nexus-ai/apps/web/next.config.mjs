/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nexus-ai/types', '@nexus-ai/validation']
};

export default nextConfig;
