export type ProductActionLink = {
  label: string;
  href: string;
  secondary?: boolean;
};

export type ProductShowcaseContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    actions: ReadonlyArray<ProductActionLink>;
    imageAlt: string;
    imageSize: number;
  };
  pillars: {
    titleId?: string;
    eyebrow: string;
    title: string;
    threeColumns?: boolean;
    items: ReadonlyArray<{ title: string; description: string }>;
  };
  showcase?: {
    id: string;
    titleId: string;
    eyebrow: string;
    title: string;
    description: string;
    frameLabel: string;
    framePath: string;
    frameTitle: string;
  };
  stack: {
    titleId: string;
    title: string;
    items: ReadonlyArray<{ label: string; technologies: string; description: string }>;
  };
  architecture: {
    titleId: string;
    title: string;
    description: string;
    clientNode: { label: string; title: string; detail: string };
    serverBox: { eyebrow: string; name: string; modules: ReadonlyArray<string>; summary: string };
    workerNodes: ReadonlyArray<{ name: string; detail: string }>;
    caption: string;
  };
  flow: {
    titleId: string;
    title: string;
    description: string;
    steps: ReadonlyArray<{ title: string; description: string }>;
  };
  technology: {
    id: string;
    title: string;
    description: string;
    items: ReadonlyArray<{ title: string; description: string }>;
  };
  runtime: {
    titleId: string;
    title: string;
    items: ReadonlyArray<{ tag: string; title: string; description: string }>;
  };
  closing: {
    title: string;
    description: string;
    actions: ReadonlyArray<ProductActionLink>;
  };
};
