import { runInNewContext } from 'node:vm';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FestivalEffects } from '../src/site/components/festival-effects';
import {
  createFestivalInitializerScript,
  isLunarNewYearWindow,
  parseFestivalOverride,
  resolveFestivalEffect,
} from '../src/site/festival';
import { ThemeProvider } from '../src/site/providers/theme-provider';

const utcNoon = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day, 4, 0, 0));
const CST_OFFSET = 8 * 60;
const IANA_TIMEZONES = ['UTC', 'Asia/Shanghai', 'America/New_York', 'Europe/London', 'Pacific/Auckland'] as const;

function createZonedCalendar(instantMs: number, timeZone: string) {
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

  const atInstant = partsFor(instantMs);
  const offsetMinutes =
    (Date.UTC(atInstant.year, atInstant.month - 1, atInstant.day, atInstant.hour, atInstant.minute, atInstant.second) -
      instantMs) /
    60_000;

  const ZonedDate = class extends Date {
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

  return { ZonedDate, offsetMinutes };
}

describe('festival schedule resolution', () => {
  it('activates memorial grayscale on national memorial days', () => {
    expect(resolveFestivalEffect(utcNoon(2026, 5, 12), null, CST_OFFSET)).toBe('memorial');
    expect(resolveFestivalEffect(utcNoon(2026, 9, 18), null, CST_OFFSET)).toBe('memorial');
    expect(resolveFestivalEffect(utcNoon(2026, 9, 30), null, CST_OFFSET)).toBe('memorial');
    expect(resolveFestivalEffect(utcNoon(2026, 12, 13), null, CST_OFFSET)).toBe('memorial');
  });

  it('activates snowfall on Christmas and Winter Solstice dates', () => {
    expect(resolveFestivalEffect(utcNoon(2026, 12, 21), null, CST_OFFSET)).toBe('snow');
    expect(resolveFestivalEffect(utcNoon(2026, 12, 22), null, CST_OFFSET)).toBe('snow');
    expect(resolveFestivalEffect(utcNoon(2026, 12, 24), null, CST_OFFSET)).toBe('snow');
    expect(resolveFestivalEffect(utcNoon(2026, 12, 25), null, CST_OFFSET)).toBe('snow');
    expect(resolveFestivalEffect(utcNoon(2026, 12, 26), null, CST_OFFSET)).toBe('snow');
  });

  it('activates red ribbons during Gregorian New Year', () => {
    expect(resolveFestivalEffect(utcNoon(2026, 12, 31), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2027, 1, 1), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2027, 1, 2), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2027, 1, 3), null, CST_OFFSET)).toBe('ribbon');
  });

  it('activates red ribbons from Lunar New Year Eve through 正月初七 including Intl fallback', () => {
    // 2026 Spring Festival is 2026-02-17: window is 2026-02-16 .. 2026-02-23
    expect(isLunarNewYearWindow(2026, 2, 15)).toBe(false);
    expect(resolveFestivalEffect(utcNoon(2026, 2, 16), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2026, 2, 17), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2026, 2, 23), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2026, 2, 24), null, CST_OFFSET)).toBe('none');

    // 2027 Spring Festival is 2027-02-07: window is 2027-02-06 .. 2027-02-13
    expect(resolveFestivalEffect(utcNoon(2027, 2, 6), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2027, 2, 7), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2027, 2, 13), null, CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(utcNoon(2027, 2, 14), null, CST_OFFSET)).toBe('none');

    // Fallback path before 2020 (2019 Spring Festival is 2019-02-05)
    expect(isLunarNewYearWindow(2019, 2, 3)).toBe(false);
    expect(isLunarNewYearWindow(2019, 2, 4)).toBe(true);
    expect(isLunarNewYearWindow(2019, 2, 5)).toBe(true);
    expect(isLunarNewYearWindow(2019, 2, 11)).toBe(true);
    expect(isLunarNewYearWindow(2019, 2, 12)).toBe(false);

    // Fallback path after 2050 (2051 Spring Festival is 2051-02-11)
    expect(isLunarNewYearWindow(2051, 2, 10)).toBe(true);
    expect(isLunarNewYearWindow(2051, 2, 11)).toBe(true);
    expect(isLunarNewYearWindow(2051, 2, 17)).toBe(true);
    expect(isLunarNewYearWindow(2051, 2, 18)).toBe(false);
  });

  it('returns none on ordinary days', () => {
    for (const [year, month, day] of [
      [2026, 1, 4],
      [2026, 6, 15],
      [2026, 11, 19],
      [2026, 12, 12],
      [2026, 12, 14],
      [2026, 12, 23],
      [2026, 12, 27],
    ] as const) {
      expect(resolveFestivalEffect(utcNoon(year, month, day), null, CST_OFFSET)).toBe('none');
    }
  });

  it('supports valid query parameter overrides and ignores unknown or malformed values', () => {
    expect(parseFestivalOverride('?festival=memorial')).toBe('memorial');
    expect(parseFestivalOverride('?foo=1&festival=SNOW')).toBe('snow');
    expect(parseFestivalOverride('?festival=ribbon')).toBe('ribbon');
    expect(parseFestivalOverride('?festival=none')).toBe('none');
    expect(parseFestivalOverride('?festival=unknown')).toBeNull();
    expect(parseFestivalOverride('?festival=%E0%A4%A')).toBeNull();

    const ordinaryDay = utcNoon(2026, 11, 19);
    expect(resolveFestivalEffect(ordinaryDay, '?festival=memorial', CST_OFFSET)).toBe('memorial');
    expect(resolveFestivalEffect(ordinaryDay, '?festival=snow', CST_OFFSET)).toBe('snow');
    expect(resolveFestivalEffect(ordinaryDay, '?festival=ribbon', CST_OFFSET)).toBe('ribbon');
    expect(resolveFestivalEffect(ordinaryDay, '?festival=unknown', CST_OFFSET)).toBe('none');
    expect(resolveFestivalEffect(ordinaryDay, '?festival=%E0%A4%A', CST_OFFSET)).toBe('none');
    expect(resolveFestivalEffect(utcNoon(2026, 12, 13), '?festival=none', CST_OFFSET)).toBe('none');
  });
});

describe('festival initializer script and SSR rendering', () => {
  const runInitializerInZone = (instantMs: number, timeZone: string, search = '') => {
    const script = createFestivalInitializerScript();
    const documentElement = { dataset: {} as Record<string, string> };
    const { ZonedDate, offsetMinutes } = createZonedCalendar(instantMs, timeZone);

    runInNewContext(script, {
      Date: ZonedDate,
      Intl,
      document: { documentElement },
      window: { location: { search } },
    });

    return {
      effect: documentElement.dataset.festival ?? 'none',
      expected: resolveFestivalEffect(new Date(instantMs), search, offsetMinutes),
    };
  };

  it('maintains inline-vs-TS parity across 5 timezones, midnight boundaries, Lunar NY table/Intl fallback, and malformed overrides', () => {
    const instants = [
      Date.UTC(2019, 1, 4, 23, 30, 0), // 2019 pre-table Lunar NY Eve (Intl fallback)
      Date.UTC(2019, 1, 12, 2, 0, 0), // 2019 post-window
      Date.UTC(2026, 1, 15, 22, 0, 0), // midnight straddle before 2026 Lunar NY Eve
      Date.UTC(2026, 1, 16, 18, 0, 0), // 2026 Lunar NY Eve / Day 1 straddle
      Date.UTC(2026, 11, 12, 20, 0, 0), // midnight straddle into 12-13 memorial day
      Date.UTC(2026, 11, 13, 12, 0, 0), // 12-13 memorial day across zones
      Date.UTC(2026, 11, 24, 21, 0, 0), // Christmas Eve / Christmas straddle
      Date.UTC(2026, 11, 31, 17, 0, 0), // New Year's Eve
      Date.UTC(2051, 1, 10, 19, 0, 0), // 2051 post-table Lunar NY Eve (Intl fallback)
      Date.UTC(2051, 1, 18, 3, 0, 0), // 2051 post-window
    ];

    for (const timeZone of IANA_TIMEZONES) {
      for (const instantMs of instants) {
        const normal = runInitializerInZone(instantMs, timeZone);
        expect(normal.effect).toBe(normal.expected);

        const malformed = runInitializerInZone(instantMs, timeZone, '?festival=%E0%A4%A');
        expect(malformed.effect).toBe(malformed.expected);
      }
    }

    expect(runInitializerInZone(Date.UTC(2026, 10, 19, 12, 0, 0), 'Asia/Shanghai', '?festival=ribbon').effect).toBe(
      'ribbon'
    );
    expect(runInitializerInZone(Date.UTC(2026, 11, 13, 12, 0, 0), 'Asia/Shanghai', '?festival=none').effect).toBe(
      'none'
    );
  });

  it('renders nothing during static SSR so build dates never leak into HTML', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <FestivalEffects />
      </ThemeProvider>
    );
    expect(html).toBe('');
  });
});
