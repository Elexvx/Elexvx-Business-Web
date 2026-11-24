export type FestivalEffect = 'none' | 'memorial' | 'snow' | 'ribbon';

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

const FESTIVAL_CONFIG = {
  queryParam: 'festival',
  msPerDay: 86_400_000,
  effectValues: ['none', 'memorial', 'snow', 'ribbon'] as const satisfies ReadonlyArray<FestivalEffect>,
  memorialDates: FESTIVAL_MEMORIAL_DATES,
  snowDates: FESTIVAL_SNOW_DATES,
  newYearDates: FESTIVAL_NEW_YEAR_DATES,
  lunarNewYearDates: LUNAR_NEW_YEAR_DATES,
} as const;

type FestivalConfig = typeof FESTIVAL_CONFIG;

// Keep this factory self-contained (no module-level captures) because
// createFestivalInitializerScript() serializes it directly into the inline <Script>.
function createFestivalResolver(config: FestivalConfig) {
  const validEffects = new Set<string>(config.effectValues);
  const memorialSet = new Set<string>(config.memorialDates);
  const snowSet = new Set<string>(config.snowDates);
  const newYearSet = new Set<string>(config.newYearDates);
  const queryPattern = new RegExp(`(?:^|[?&])${config.queryParam}=([^&#]*)`, 'i');

  const pad2 = (value: number) => (value < 10 ? `0${value}` : String(value));

  const parseOverride = (search?: string | null): FestivalEffect | null => {
    if (!search) return null;
    const match = search.match(queryPattern);
    if (!match) return null;
    try {
      const candidate = decodeURIComponent(match[1]).trim().toLowerCase();
      return validEffects.has(candidate) ? (candidate as FestivalEffect) : null;
    } catch {
      return null;
    }
  };

  const getCalendarDateParts = (
    date: Date,
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

  const getIntlChineseLunarParts = (
    year: number,
    month: number,
    day: number
  ): { month: number; day: number } | null => {
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

  const isLunarNewYearWindow = (year: number, month: number, day: number): boolean => {
    const springFestivalIso = config.lunarNewYearDates[year];
    if (springFestivalIso) {
      const [targetYear, targetMonth, targetDay] = springFestivalIso.split('-').map(Number);
      const currentUtcDay = Date.UTC(year, month - 1, day);
      const festivalUtcDay = Date.UTC(targetYear, targetMonth - 1, targetDay);
      const diffDays = Math.round((currentUtcDay - festivalUtcDay) / config.msPerDay);
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

  const resolveEffect = (
    date: Date = new Date(),
    search?: string | null,
    timeZoneOffsetMinutes?: number
  ): FestivalEffect => {
    const override = parseOverride(search);
    if (override !== null) return override;

    const { year, month, day } = getCalendarDateParts(date, timeZoneOffsetMinutes);
    const monthDay = `${pad2(month)}-${pad2(day)}`;

    // Memorial grayscale always takes highest priority over celebratory effects.
    if (memorialSet.has(monthDay)) return 'memorial';
    if (newYearSet.has(monthDay) || isLunarNewYearWindow(year, month, day)) return 'ribbon';
    if (snowSet.has(monthDay)) return 'snow';
    return 'none';
  };

  return { parseOverride, isLunarNewYearWindow, resolveEffect };
}

const festivalResolver = createFestivalResolver(FESTIVAL_CONFIG);

export const parseFestivalOverride = festivalResolver.parseOverride;
export const isLunarNewYearWindow = festivalResolver.isLunarNewYearWindow;
export const resolveFestivalEffect = festivalResolver.resolveEffect;

export const createFestivalInitializerScript = (): string => `(() => {
  const __name = (target) => target;
  const resolver = (${createFestivalResolver.toString()})(${JSON.stringify(FESTIVAL_CONFIG)});
  const search = typeof window !== 'undefined' && window.location ? window.location.search : '';
  const effect = resolver.resolveEffect(new Date(), search);
  if (effect === 'none') delete document.documentElement.dataset.festival;
  else document.documentElement.dataset.festival = effect;
})();`;
