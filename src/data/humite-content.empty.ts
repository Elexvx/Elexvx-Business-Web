import type { ProductShowcaseContent } from './product-pages';

export type HumiteReleaseContent = {
  intro: {
    release: string;
    title: string;
    description: string;
    action: string;
    actionHref: string;
    showcase: { path: string; label: string; title: string; previewImage?: string };
  };
  card: { name: string; slug: string; image: string; href: string; category: string; description: string };
  showcase: ProductShowcaseContent;
  english: Record<string, string>;
};

export const humiteContent: HumiteReleaseContent | null = null;
