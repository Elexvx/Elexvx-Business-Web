import { describe, expect, it } from 'vitest';
import { createLinkAvailability } from '../src/data/navigation-availability';

describe('shared navigation availability', () => {
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
});
