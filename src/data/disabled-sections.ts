/** Temporarily removed sections. Archived source: parked-pages/navigation-sections. */
export const disabledSections = ['/capabilities', '/projects', '/scenarios', '/insights', '/archive'];
export const isDisabledPath = (href: string) => {
  const path = href.split(/[?#]/)[0].replace(/^\/en(?=\/|$)/, '');
  return disabledSections.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};
