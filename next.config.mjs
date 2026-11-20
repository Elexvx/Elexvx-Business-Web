import { isHumitePublicBuild } from './scripts/humite-export.mjs';

const development = process.env.NODE_ENV === 'development';
const humitePublished = isHumitePublicBuild();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: development ? undefined : 'export',
  env: { NEXT_PUBLIC_HUMITE_PUBLISHED: String(humitePublished) },
  turbopack: {
    resolveAlias: {
      '#humite-content': humitePublished ? './release-assets/humite-content.ts' : './src/data/humite-content.empty.ts',
    },
  },
  trailingSlash: true,
  // Keep Turbopack's development cache separate from the static export.
  distDir: development ? 'dist-dev' : 'dist',
  poweredByHeader: false,
  reactStrictMode: true,
  pageExtensions: ['tsx'],
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
