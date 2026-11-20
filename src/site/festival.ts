export type FestivalEffect = 'none' | 'memorial' | 'snow' | 'ribbon';

const FESTIVAL_QUERY_PARAM = 'festival';
const MS_PER_DAY = 86_400_000;
const FESTIVAL_EFFECT_VALUES = ['none', 'memorial', 'snow', 'ribbon'] as const satisfies ReadonlyArray<FestivalEffect>;

/**
 * National memorial days (MM-DD) where the whole site renders in solemn grayscale.
 * - 05-12: May 12 National Disaster Prevention and Reduction / Wenchuan Earthquake Memorial Day
 * - 09-18: September 18 Incident Memorial Day
 * - 09-30: Martyrs' Day
 * - 12-13: National Memorial Day for Nanjing Massacre Victims
 */
const FESTIVAL_MEMORIAL_DATES = ['05-12', '09-18', '09-30', '12-13'] as const;

/**
 * Winter & Christmas dates (MM-DD) with falling snow effects.
 * - 12-21..12-22: Winter Solstice
 * - 12-24..12-26: Christmas Eve & Christmas
 */
const FESTIVAL_SNOW_DATES = ['12-21', '12-22', '12-24', '12-25', '12-26'] as const;

/**
 * Gregorian New Year window (MM-DD) with red festive ribbons.
 */
const FESTIVAL_NEW_YEAR_DATES = ['12-31', '01-01', '01-02', '01-03'] as const;

/**
 * Precomputed Chinese Lunar New Year (正月初一) Gregorian dates (2020-2050).
 * Spring Festival runs from Lunar New Year's Eve (除夕, -1 day) through 正月初七 (+6 days).
 */
const LUNAR_NEW_YEAR_DATES: Readonly<Record<number, string>> = {
  2020: '2020-01-25',
  2021: '2021-02-12',
  2022: '2022-02-01',
  2023: '2023-01-22',
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-07',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-02',
  2031: '2031-01-23',
  2032: '2032-02-11',
  2033: '2033-01-31',
  2034: '2034-02-19',
  2035: '2035-02-08',
  2036: '2036-01-28',
  2037: '2037-02-15',
  2038: '2038-02-04',
  2039: '2039-01-24',
  2040: '2040-02-12',
  2041: '2041-02-01',
  2042: '2042-01-22',
  2043: '2043-02-10',
  2044: '2044-01-30',
  2045: '2045-02-17',
  2046: '2046-02-06',
  2047: '2047-01-26',
  2048: '2048-02-14',
  2049: '2049-02-02',
  2050: '2050-01-23',
};

const VALID_FESTIVAL_EFFECTS = new Set<FestivalEffect>(FESTIVAL_EFFECT_VALUES);
const MEMORIAL_SET = new Set<string>(FESTIVAL_MEMORIAL_DATES);
const SNOW_SET = new Set<string>(FESTIVAL_SNOW_DATES);
const NEW_YEAR_SET = new Set<string>(FESTIVAL_NEW_YEAR_DATES);

const pad2 = (value: number) => String(value).padStart(2, '0');

export const parseFestivalOverride = (search?: string | null): FestivalEffect | null => {
  if (!search) return null;
  const match = search.match(new RegExp(`(?:^|[?&])${FESTIVAL_QUERY_PARAM}=([^&#]*)`, 'i'));
  if (!match) return null;
  try {
    const candidate = decodeURIComponent(match[1]).trim().toLowerCase() as FestivalEffect;
    return VALID_FESTIVAL_EFFECTS.has(candidate) ? candidate : null;
  } catch {
    return null;
  }
};

const getCalendarDateParts = (
  date: Date = new Date(),
  timeZoneOffsetMinutes?: number
): { year: number; month: number; day: number } => {
  if (typeof timeZoneOffsetMinutes === 'number') {
    const shifted = new Date(date.getTime() + timeZoneOffsetMinutes * 60_000);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
    };
  }
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const getIntlChineseLunarParts = (year: number, month: number, day: number): { month: number; day: number } | null => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-chinese', {
      timeZone: 'UTC',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
    const lunarMonth = Number(parts.find((part) => part.type === 'month')?.value);
    const lunarDay = Number(parts.find((part) => part.type === 'day')?.value);
    if (!Number.isInteger(lunarMonth) || !Number.isInteger(lunarDay)) return null;
    return { month: lunarMonth, day: lunarDay };
  } catch {
    return null;
  }
};

export const isLunarNewYearWindow = (year: number, month: number, day: number): boolean => {
  const springFestivalIso = LUNAR_NEW_YEAR_DATES[year];
  if (springFestivalIso) {
    const [targetYear, targetMonth, targetDay] = springFestivalIso.split('-').map(Number);
    const currentUtcDay = Date.UTC(year, month - 1, day);
    const festivalUtcDay = Date.UTC(targetYear, targetMonth - 1, targetDay);
    const diffDays = Math.round((currentUtcDay - festivalUtcDay) / MS_PER_DAY);
    return diffDays >= -1 && diffDays <= 6;
  }

  const today = getIntlChineseLunarParts(year, month, day);
  if (today && today.month === 1 && today.day >= 1 && today.day <= 7) return true;
  const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));
  const tomorrow = getIntlChineseLunarParts(
    tomorrowDate.getUTCFullYear(),
    tomorrowDate.getUTCMonth() + 1,
    tomorrowDate.getUTCDate()
  );
  return Boolean(tomorrow && tomorrow.month === 1 && tomorrow.day === 1);
};

export const resolveFestivalEffect = (
  date: Date = new Date(),
  search?: string | null,
  timeZoneOffsetMinutes?: number
): FestivalEffect => {
  const override = parseFestivalOverride(search);
  if (override !== null) return override;

  const { year, month, day } = getCalendarDateParts(date, timeZoneOffsetMinutes);
  const monthDay = `${pad2(month)}-${pad2(day)}`;

  // Memorial grayscale always takes highest priority over celebratory effects.
  if (MEMORIAL_SET.has(monthDay)) return 'memorial';
  if (NEW_YEAR_SET.has(monthDay) || isLunarNewYearWindow(year, month, day)) return 'ribbon';
  if (SNOW_SET.has(monthDay)) return 'snow';
  return 'none';
};

// SYNC CONTRACT: Keep parseOverride(), isLunarNewYear(), and resolve() in sync with
// parseFestivalOverride(), isLunarNewYearWindow(), and resolveFestivalEffect() above.
// Must remain a self-contained IIFE template string (no module imports) for <Script strategy="beforeInteractive">.
export const createFestivalInitializerScript = (): string => `(() => {
  const memorialDates = new Set(${JSON.stringify(FESTIVAL_MEMORIAL_DATES)});
  const snowDates = new Set(${JSON.stringify(FESTIVAL_SNOW_DATES)});
  const newYearDates = new Set(${JSON.stringify(FESTIVAL_NEW_YEAR_DATES)});
  const lunarNewYearDates = ${JSON.stringify(LUNAR_NEW_YEAR_DATES)};
  const validEffects = new Set(${JSON.stringify(FESTIVAL_EFFECT_VALUES)});
  const parseOverride = (search) => {
    if (!search) return null;
    const match = search.match(/(?:^|[?&])${FESTIVAL_QUERY_PARAM}=([^&#]*)/i);
    if (!match) return null;
    try {
      const value = decodeURIComponent(match[1]).trim().toLowerCase();
      return validEffects.has(value) ? value : null;
    } catch {
      return null;
    }
  };
  const isLunarNewYear = (year, month, day) => {
    const iso = lunarNewYearDates[year];
    if (iso) {
      const parts = iso.split('-');
      const diff = Math.round(
        (Date.UTC(year, month - 1, day) - Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))) / ${MS_PER_DAY}
      );
      return diff >= -1 && diff <= 6;
    }
    try {
      const fmt = new Intl.DateTimeFormat('en-US-u-ca-chinese', { timeZone: 'UTC', month: 'numeric', day: 'numeric' });
      const read = (y, m, d) => {
        const parts = fmt.formatToParts(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)));
        const lm = Number((parts.find((p) => p.type === 'month') || {}).value);
        const ld = Number((parts.find((p) => p.type === 'day') || {}).value);
        return Number.isInteger(lm) && Number.isInteger(ld) ? { m: lm, d: ld } : null;
      };
      const today = read(year, month, day);
      if (today && today.m === 1 && today.d >= 1 && today.d <= 7) return true;
      const next = new Date(Date.UTC(year, month - 1, day + 1));
      const tomorrow = read(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
      return Boolean(tomorrow && tomorrow.m === 1 && tomorrow.d === 1);
    } catch {
      return false;
    }
  };
  const resolve = () => {
    const override = parseOverride(typeof window !== 'undefined' && window.location ? window.location.search : '');
    if (override !== null) return override;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    const key = pad(month) + '-' + pad(day);
    if (memorialDates.has(key)) return 'memorial';
    if (newYearDates.has(key) || isLunarNewYear(year, month, day)) return 'ribbon';
    if (snowDates.has(key)) return 'snow';
    return 'none';
  };
  const effect = resolve();
  if (effect === 'none') delete document.documentElement.dataset.festival;
  else document.documentElement.dataset.festival = effect;
})();`;
