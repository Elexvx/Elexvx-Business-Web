import { describe, expect, it } from 'vitest';

import { DEFAULT_SUN_LOCATION, getSolarTheme, getSystemTheme, isSunLocation } from '../src/site/theme';

describe('theme preference resolution', () => {
  it('uses the browser media preference when it is available', () => {
    expect(getSystemTheme({ matches: true })).toBe('dark');
    expect(getSystemTheme({ matches: false })).toBe('light');
    expect(getSystemTheme(null)).toBeNull();
  });

  it('uses calculated sunrise and sunset for the fallback theme', () => {
    const daytime = new Date(Date.UTC(2026, 8, 7, 4));
    const nighttime = new Date(Date.UTC(2026, 8, 7, 14));

    expect(getSolarTheme(daytime, DEFAULT_SUN_LOCATION)).toBe('light');
    expect(getSolarTheme(nighttime, DEFAULT_SUN_LOCATION)).toBe('dark');
  });

  it('rejects invalid geolocation results', () => {
    expect(isSunLocation({ latitude: 32, longitude: 118 })).toBe(true);
    expect(isSunLocation({ latitude: 91, longitude: 118 })).toBe(false);
    expect(isSunLocation(null)).toBe(false);
  });
});
