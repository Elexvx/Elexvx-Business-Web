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
  // Serve both URL forms in dev so cached permanent redirects cannot create a loop.
  skipTrailingSlashRedirect: development,
  ...(development
    ? {
        headers: () => [
          {
            source: '/',
            // Recover opposite 308s cached by an earlier server on this dev origin.
            // Clear only the HTTP cache; retain language, theme and consent preferences.
            headers: [{ key: 'Clear-Site-Data', value: '"cache"' }],
          },
        ],
      }
    : {}),
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
