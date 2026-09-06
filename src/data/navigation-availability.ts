export const createLinkAvailability = (routePaths: string[], publishedDirectionSlugs: (string | undefined)[]) => {
  const paths = new Set(routePaths);
  const populatedDirections = new Set(publishedDirectionSlugs);
  return (href: string) => {
    if (/^(https?:|mailto:|tel:)/.test(href)) return true;
    const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    if (!paths.has(path)) return false;
    return !path.startsWith('/research/') || populatedDirections.has(path.slice('/research/'.length));
  };
};
