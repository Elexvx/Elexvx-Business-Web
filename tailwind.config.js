import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

const blockquoteReset = {
  'blockquote::before': {
    content: 'none !important',
  },
  'blockquote::after': {
    content: 'none !important',
  },
  'blockquote p:first-of-type::before': {
    content: 'none !important',
  },
  'blockquote p:last-of-type::after': {
    content: 'none !important',
  },
};

const compactReadingStyles = {
  h1: {
    'font-size': '1.75rem',
    'line-height': '1.25',
    'margin-top': '0.15em',
    'margin-bottom': '0.10em',
  },
  h2: {
    'font-size': '1.5rem',
    'line-height': '1.25',
    'margin-top': '0.15em',
    'margin-bottom': '0.08em',
  },
  h3: {
    'font-size': '1.25rem',
    'line-height': '1.30',
    'margin-top': '0.12em',
    'margin-bottom': '0.08em',
  },
  p: {
    'margin-top': '0',
    'margin-bottom': '0.25em',
    'line-height': '1.50',
  },
  li: {
    'margin-top': '0.05em',
    'margin-bottom': '0.05em',
  },
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Source Han Sans', 'sans-serif'],
        serif: ['PingFang SC', 'Source Han Sans', 'serif'],
        heading: ['PingFang SC', 'Source Han Sans', 'sans-serif'],
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        fade: 'fadeInUp 1s both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin({
      theme: {
        extend: {
          typography: {
            DEFAULT: {
              css: {
                ...blockquoteReset,
                ...compactReadingStyles,
              },
            },
            sm: {
              css: {
                ...blockquoteReset,
                ...compactReadingStyles,
              },
            },
            lg: {
              css: {
                ...blockquoteReset,
                ...compactReadingStyles,
              },
            },
            xl: {
              css: {
                ...blockquoteReset,
                ...compactReadingStyles,
              },
            },
          },
        },
      },
    }),
    plugin(({ addVariant, addUtilities }) => {
      addVariant('intersect', '&:not([no-intersect])');
      // Optimized line-clamp utilities for better truncation
      addUtilities({
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
          'line-height': '1.5',
          'word-break': 'break-word',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
          'line-height': '1.5',
          'word-break': 'break-word',
          'max-height': '3em', // 2 lines x 1.5 line height
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
          'line-height': '1.5',
          'word-break': 'break-word',
          'max-height': '4.5em', // 3 lines x 1.5 line height
        },
      });
    }),
  ],
  darkMode: 'class',
};
