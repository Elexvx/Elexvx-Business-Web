import { describe, expect, it } from 'vitest';
import { createLinkAvailability } from '../src/data/navigation-availability';
import { navigationGroups } from '../src/data/research-navigation';

describe('shared navigation availability', () => {
  it('places the service hub before the Elexvx company section', () => {
    const ids = navigationGroups.map((group) => group.id);

    expect(ids.indexOf('services')).toBeLessThan(ids.indexOf('company'));
  });

  it('includes published research articles in search availability', () => {
    expect(createLinkAvailability(['/research/example'], ['example'])('/research/example')).toBe(true);
  });
  it('hides parked directions even when their published articles remain', () => {
    const available = createLinkAvailability(['/research', '/insights/example'], ['ai-data']);
    expect(available('/research/ai-data')).toBe(false);
    expect(available('/insights/example/')).toBe(true);
    expect(available('/research#articles')).toBe(true);
  });
  it('restores a direction only when its route and published content both exist', () => {
    const paths = ['/research/ai-data'];
    expect(createLinkAvailability(paths, [])('/research/ai-data')).toBe(false);
    expect(createLinkAvailability(paths, ['ai-data'])('/research/ai-data/')).toBe(true);
    expect(createLinkAvailability(paths, ['ai-data'])('/missing')).toBe(false);
  });
  it('keeps shared service routes available even when the content route index is generated separately', () => {
    const available = createLinkAvailability(['/research'], []);
    expect(available('/navigation/')).toBe(true);
    expect(available('/status/')).toBe(true);
    expect(available('/status/history/')).toBe(true);
  });
});
