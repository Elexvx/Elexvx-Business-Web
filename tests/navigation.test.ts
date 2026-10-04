import { describe, expect, it } from 'vitest';
import { createLinkAvailability } from '../src/data/navigation-availability';
import { navigationGroups, withNewsCategories } from '../src/data/research-navigation';

describe('shared navigation availability', () => {
  it('links category menus to independently crawlable pages', () => {
    const groups = withNewsCategories(navigationGroups, ['公告']);
    const links = groups.flatMap((group) => group.columns.flatMap((column) => column.links));
    expect(links.some((link) => link.href === '/research/category/chip-architecture/')).toBe(true);
    expect(links.some((link) => link.href === '/news/category/announcements/')).toBe(true);
    expect(links.some((link) => link.href.includes('?category='))).toBe(false);
    const available = createLinkAvailability(['/research/category/chip-architecture']);
    expect(available('/research/category/chip-architecture/')).toBe(true);
    expect(available('/research/category/missing/')).toBe(false);
  });
  it('places the service hub before the Elexvx company section', () => {
    const ids = navigationGroups.map((group) => group.id);

    expect(ids.indexOf('services')).toBeLessThan(ids.indexOf('company'));
  });

  it('does not expose a standalone reading menu', () => {
    const ids = navigationGroups.map((group) => group.id);

    expect(ids).toContain('activities');
    expect(ids).not.toContain('read');
    expect(navigationGroups.find((group) => group.id === 'research')?.paths).toContain('/insights');
  });

  it('includes published research articles in search availability', () => {
    expect(createLinkAvailability(['/research/example'])('/research/example')).toBe(true);
  });
  it('only exposes research pages that have generated routes', () => {
    const available = createLinkAvailability(['/research', '/insights/example']);
    expect(available('/research/ai-data')).toBe(false);
    expect(available('/insights/example/')).toBe(true);
    expect(available('/research#articles')).toBe(true);
  });
  it('exposes a generated research direction without requiring a published article', () => {
    const paths = ['/research/ai-data'];
    expect(createLinkAvailability(paths)('/research/ai-data/')).toBe(true);
    expect(createLinkAvailability(paths)('/missing')).toBe(false);
  });
  it('keeps shared service routes available even when the content route index is generated separately', () => {
    const available = createLinkAvailability(['/research']);
    expect(available('/navigation/')).toBe(true);
    expect(available('/status/')).toBe(true);
    expect(available('/status/history/')).toBe(true);
  });
});
