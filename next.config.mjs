/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'dist',
  poweredByHeader: false,
  reactStrictMode: true,
  pageExtensions: ['tsx'],
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
