import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { getNextThemeMode } from '../src/site/providers/theme-provider';
import {
  createThemeInitializerScript,
  DEFAULT_SUN_LOCATION,
  getSolarTheme,
  isSunLocation,
  THEME_STORAGE_KEY,
} from '../src/site/theme';

const IANA_TIMEZONES = ['UTC', 'Asia/Shanghai', 'America/New_York', 'Europe/London', 'Pacific/Auckland'] as const;

function createZonedDateClass(instantMs: number, timeZone: string): typeof Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const partsFor = (epochMs: number) => {
    const parts = formatter.formatToParts(new Date(epochMs));
    const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    return {
      year: read('year'),
      month: read('month'),
      day: read('day'),
      hour: read('hour'),
      minute: read('minute'),
      second: read('second'),
    };
  };

  return class ZonedDate extends Date {
    constructor(
      value?: string | number | Date,
      month?: number,
      date?: number,
      hours?: number,
      minutes?: number,
      seconds?: number,
      ms?: number
    ) {
      if (value === undefined) super(instantMs);
      else if (typeof value === 'number' && typeof month === 'number') {
        super(value, month, date ?? 1, hours ?? 0, minutes ?? 0, seconds ?? 0, ms ?? 0);
      } else {
        super(value);
      }
    }

    override getFullYear() {
      return partsFor(this.getTime()).year;
    }

    override getMonth() {
      return partsFor(this.getTime()).month - 1;
    }

    override getDate() {
      return partsFor(this.getTime()).day;
    }

    override getHours() {
      return partsFor(this.getTime()).hour;
    }

    override getMinutes() {
      return partsFor(this.getTime()).minute;
    }

    override getSeconds() {
      return partsFor(this.getTime()).second;
    }
  } as typeof Date;
}

function runThemeInitializer({
  instantMs,
  timeZone,
  pathname = '/',
  localStorage,
}: {
  instantMs: number;
  timeZone: string;
  pathname?: string;
  localStorage: { getItem: (key: string) => string | null };
}) {
  const script = createThemeInitializerScript();
  const documentElement = { lang: '', dataset: {} as Record<string, string>, style: { colorScheme: '' } };
  const ZonedDate = createZonedDateClass(instantMs, timeZone);

  runInNewContext(script, {
    Date: ZonedDate,
    document: { documentElement },
    window: {
      location: { pathname },
      localStorage,
    },
  });

  return documentElement;
}

describe('theme preference resolution', () => {
  it('uses calculated sunrise and sunset for the fallback theme', () => {
    const daytime = new Date(Date.UTC(2026, 8, 7, 4));
    const nighttime = new Date(Date.UTC(2026, 8, 7, 14));

    expect(getSolarTheme(daytime, DEFAULT_SUN_LOCATION)).toBe('light');
    expect(getSolarTheme(nighttime, DEFAULT_SUN_LOCATION)).toBe('dark');
  });

  it('falls back to civil daylight hours in polar regions across timezones', () => {
    const polarLocation = { latitude: 80, longitude: 0 };
    const winterDay = Date.UTC(2026, 11, 21, 12, 0, 0);
    const ZonedUtc = createZonedDateClass(winterDay, 'UTC');
    const ZonedShanghai = createZonedDateClass(winterDay, 'Asia/Shanghai');

    // 12:00 UTC is 12:00 in UTC (light) and 20:00 in Asia/Shanghai (dark).
    expect(getSolarTheme(new ZonedUtc(), polarLocation)).toBe('light');
    expect(getSolarTheme(new ZonedShanghai(), polarLocation)).toBe('dark');
  });

  it('rejects invalid geolocation results', () => {
    expect(isSunLocation({ latitude: 32, longitude: 118 })).toBe(true);
    expect(isSunLocation({ latitude: 91, longitude: 118 })).toBe(false);
    expect(isSunLocation(null)).toBe(false);
  });

  it('handles stored, empty, invalid, and throwing localStorage values plus localized lang', () => {
    const instantMs = Date.UTC(2026, 8, 7, 4, 0, 0);

    const storedDark = runThemeInitializer({
      instantMs,
      timeZone: 'UTC',
      pathname: '/en/about/',
      localStorage: { getItem: (key) => (key === THEME_STORAGE_KEY ? 'dark' : null) },
    });
    expect(storedDark.lang).toBe('en');
    expect(storedDark.dataset.theme).toBe('dark');
    expect(storedDark.style.colorScheme).toBe('dark');

    const expectedSolar = getSolarTheme(new Date(instantMs), DEFAULT_SUN_LOCATION);
    for (const localStorage of [
      { getItem: () => null },
      { getItem: () => 'sepia' },
      {
        getItem: () => {
          throw new Error('Storage blocked');
        },
      },
    ]) {
      const result = runThemeInitializer({ instantMs, timeZone: 'UTC', pathname: '/research/', localStorage });
      expect(result.lang).toBe('zh-CN');
      expect(result.dataset.theme).toBe(expectedSolar);
      expect(result.style.colorScheme).toBe(expectedSolar);
    }
  });

  it('maintains inline solarTheme parity with getSolarTheme across solstices, equinoxes, leap day, and 5 timezones', () => {
    const testInstants = [
      Date.UTC(2024, 1, 29, 4, 30, 0),
      Date.UTC(2026, 2, 20, 10, 0, 0),
      Date.UTC(2026, 2, 20, 22, 15, 0),
      Date.UTC(2026, 5, 21, 0, 0, 0),
      Date.UTC(2026, 5, 21, 11, 45, 0),
      Date.UTC(2026, 8, 22, 21, 50, 0),
      Date.UTC(2026, 11, 21, 9, 55, 0),
      Date.UTC(2026, 11, 21, 23, 10, 0),
    ];

    for (const timeZone of IANA_TIMEZONES) {
      for (const instantMs of testInstants) {
        const ZonedDate = createZonedDateClass(instantMs, timeZone);
        const expected = getSolarTheme(new ZonedDate(), DEFAULT_SUN_LOCATION);
        const element = runThemeInitializer({
          instantMs,
          timeZone,
          localStorage: { getItem: () => null },
        });
        expect(element.dataset.theme).toBe(expected);
        expect(element.style.colorScheme).toBe(expected);
      }
    }
  });

  it('resolves pre-dawn Shanghai time as dark and cycles back to automatic mode', () => {
    const preDawnInstant = Date.parse('2026-11-25T03:19:41+08:00');
    const ZonedShanghai = createZonedDateClass(preDawnInstant, 'Asia/Shanghai');

    expect(getSolarTheme(new ZonedShanghai(), DEFAULT_SUN_LOCATION)).toBe('dark');
    const initialized = runThemeInitializer({
      instantMs: preDawnInstant,
      timeZone: 'Asia/Shanghai',
      pathname: '/company/',
      localStorage: { getItem: () => null },
    });
    expect(initialized.dataset.theme).toBe('dark');

    expect(getNextThemeMode('auto', 'dark')).toBe('light');
    expect(getNextThemeMode('light', 'dark')).toBe('dark');
    expect(getNextThemeMode('dark', 'dark')).toBe('auto');

    expect(getNextThemeMode('auto', 'light')).toBe('dark');
    expect(getNextThemeMode('dark', 'light')).toBe('light');
    expect(getNextThemeMode('light', 'light')).toBe('auto');
  });
});
