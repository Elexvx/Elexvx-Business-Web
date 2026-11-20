/** Temporarily removed sections. Archived source: parked-pages/navigation-sections. */
const disabledSections = ['/capabilities', '/projects', '/scenarios', '/archive'];
export const isDisabledPath = (href: string) => {
  const path = href.split(/[?#]/)[0].replace(/^\/en(?=\/|$)/, '');
  return disabledSections.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};
