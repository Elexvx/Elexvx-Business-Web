'use client';

import dynamic from 'next/dynamic';

// Article-only parsing and math rendering stay out of listing and homepage bundles.
export const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer').then((module) => module.MarkdownRenderer));
