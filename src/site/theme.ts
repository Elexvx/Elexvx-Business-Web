export type ColorTheme = 'light' | 'dark';

export type SunLocation = {
  latitude: number;
  longitude: number;
};

export const THEME_STORAGE_KEY = 'elexvx-theme-mode';

// Used when location access is unavailable. The site is operated from Nanjing.
export const DEFAULT_SUN_LOCATION: SunLocation = {
  latitude: 32.0603,
  longitude: 118.7969,
};

const MS_PER_DAY = 86_400_000;
const GEOLOCATION_TIMEOUT_MS = 2_000;

const SOLAR_THEME_CONFIG = {
  sunZenith: 90.8333,
  hoursInDay: 24,
  minutesInHour: 60,
  degreesInCircle: 360,
  msPerHour: 3_600_000,
  msPerDay: MS_PER_DAY,
  civilDaylightStartHour: 6,
  civilDaylightEndHour: 18,
} as const;

type SolarThemeConfig = typeof SOLAR_THEME_CONFIG;

// Keep this function self-contained (no module-level captures) because
// createThemeInitializerScript() serializes it directly into the inline <Script>.
function resolveSolarThemeWithConfig(date: Date, location: SunLocation, config: SolarThemeConfig): ColorTheme {
  const radians = Math.PI / 180;
  const normalizeHours = (hours: number) => ((hours % config.hoursInDay) + config.hoursInDay) % config.hoursInDay;
  const normalizeDegrees = (degrees: number) =>
    ((degrees % config.degreesInCircle) + config.degreesInCircle) % config.degreesInCircle;

  const longitudeHour = location.longitude / 15;
  const solarDate = new Date(date.getTime() + longitudeHour * config.msPerHour);
  const start = Date.UTC(solarDate.getUTCFullYear(), 0, 0);
  const current = Date.UTC(solarDate.getUTCFullYear(), solarDate.getUTCMonth(), solarDate.getUTCDate());
  const ordinalDay = Math.floor((current - start) / config.msPerDay);

  const utcSolarHour = (rising: boolean): number | undefined => {
    const approximateTime = ordinalDay + ((rising ? 6 : 18) - longitudeHour) / config.hoursInDay;
    const meanAnomaly = 0.9856 * approximateTime - 3.289;
    const trueLongitude = normalizeDegrees(
      meanAnomaly + 1.916 * Math.sin(meanAnomaly * radians) + 0.02 * Math.sin(2 * meanAnomaly * radians) + 282.634
    );
    const rightAscension = normalizeDegrees(Math.atan(0.91764 * Math.tan(trueLongitude * radians)) / radians);
    const longitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
    const rightAscensionQuadrant = Math.floor(rightAscension / 90) * 90;
    const adjustedRightAscension = (rightAscension + longitudeQuadrant - rightAscensionQuadrant) / 15;
    const sineDeclination = 0.39782 * Math.sin(trueLongitude * radians);
    const cosineDeclination = Math.cos(Math.asin(sineDeclination));
    const cosineHourAngle =
      (Math.cos(config.sunZenith * radians) - sineDeclination * Math.sin(location.latitude * radians)) /
      (cosineDeclination * Math.cos(location.latitude * radians));

    if (cosineHourAngle > 1 || cosineHourAngle < -1) return undefined;

    const hourAngle = rising
      ? config.degreesInCircle - Math.acos(cosineHourAngle) / radians
      : Math.acos(cosineHourAngle) / radians;
    const localMeanTime = hourAngle / 15 + adjustedRightAscension - 0.06571 * approximateTime - 6.622;
    return normalizeHours(localMeanTime - longitudeHour);
  };

  const sunriseUtc = utcSolarHour(true);
  const sunsetUtc = utcSolarHour(false);

  // Polar day/night has no ordinary sunrise or sunset. Keep a safe civil-time fallback there.
  if (sunriseUtc === undefined || sunsetUtc === undefined) {
    const hour = date.getHours();
    return hour >= config.civilDaylightStartHour && hour < config.civilDaylightEndHour ? 'light' : 'dark';
  }

  const currentSolarHour = normalizeHours(
    date.getUTCHours() + date.getUTCMinutes() / config.minutesInHour + longitudeHour
  );
  const sunriseSolarHour = normalizeHours(sunriseUtc + longitudeHour);
  const sunsetSolarHour = normalizeHours(sunsetUtc + longitudeHour);
  const isDaylight =
    sunriseSolarHour < sunsetSolarHour
      ? currentSolarHour >= sunriseSolarHour && currentSolarHour < sunsetSolarHour
      : currentSolarHour >= sunriseSolarHour || currentSolarHour < sunsetSolarHour;

  return isDaylight ? 'light' : 'dark';
}

export const getSolarTheme = (date = new Date(), location: SunLocation = DEFAULT_SUN_LOCATION): ColorTheme =>
  resolveSolarThemeWithConfig(date, location, SOLAR_THEME_CONFIG);

export const isSunLocation = (value: SunLocation | null | undefined): value is SunLocation =>
  Boolean(
    value &&
      Number.isFinite(value.latitude) &&
      Number.isFinite(value.longitude) &&
      value.latitude >= -90 &&
      value.latitude <= 90 &&
      value.longitude >= -180 &&
      value.longitude <= 180
  );

export const getGrantedSunLocation = async (): Promise<SunLocation | undefined> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation || !navigator.permissions?.query) return undefined;

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state !== 'granted') return undefined;
  } catch {
    return undefined;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        resolve(isSunLocation(location) ? location : undefined);
      },
      () => resolve(undefined),
      { enableHighAccuracy: false, maximumAge: MS_PER_DAY, timeout: GEOLOCATION_TIMEOUT_MS }
    );
  });
};

export const createThemeInitializerScript = (): string => `(() => {
  document.documentElement.lang = /^\\/en(?:\\/|$)/.test(window.location.pathname) ? 'en' : 'zh-CN';
  const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  const resolveSolarTheme = ${resolveSolarThemeWithConfig.toString()};
  const defaultLocation = ${JSON.stringify(DEFAULT_SUN_LOCATION)};
  const solarConfig = ${JSON.stringify(SOLAR_THEME_CONFIG)};
  const solarTheme = () => resolveSolarTheme(new Date(), defaultLocation, solarConfig);
  let theme;
  try {
    const storedMode = window.localStorage.getItem(storageKey);
    theme = storedMode === 'light' || storedMode === 'dark' ? storedMode : solarTheme();
  } catch {
    theme = solarTheme();
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`;
