/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: { inlineCss: true },
  trailingSlash: true,
  // Keep Turbopack's development cache separate from the static export.
  distDir: process.env.NODE_ENV === 'development' ? 'dist-dev' : 'dist',
  poweredByHeader: false,
  reactStrictMode: true,
  pageExtensions: ['tsx'],
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
