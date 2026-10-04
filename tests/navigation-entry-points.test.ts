import { describe, expect, it } from 'vitest';
import { navigationGroups } from '../src/data/research-navigation';
import { existingEnglish } from '../src/site/translation-base';

const linksFor = (groupId: string) =>
  navigationGroups.find((group) => group.id === groupId)?.columns.flatMap((column) => column.links) ?? [];

describe('shared navigation entry points', () => {
  it('keeps the research directions discoverable in the main navigation data', () => {
    const paths = linksFor('research').map((link) => link.href);

    expect(paths).toEqual(
      expect.arrayContaining(['/research/ai-data', '/research/industrial-intelligence', '/research/llm-ai-safety'])
    );
  });

  it('exposes a direct contact link in the Elexvx group in both locales', () => {
    expect(linksFor('company')).toContainEqual({ label: '联系我们', href: '/contact' });
    expect(existingEnglish['联系我们']).toBe('Contact us');
  });
});
