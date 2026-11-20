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

const SUN_ZENITH = 90.8333;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const DEGREES_IN_CIRCLE = 360;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const CIVIL_DAYLIGHT_START_HOUR = 6;
const CIVIL_DAYLIGHT_END_HOUR = 18;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

const normalizeHours = (hours: number) => ((hours % HOURS_IN_DAY) + HOURS_IN_DAY) % HOURS_IN_DAY;
const normalizeDegrees = (degrees: number) => ((degrees % DEGREES_IN_CIRCLE) + DEGREES_IN_CIRCLE) % DEGREES_IN_CIRCLE;

const dayOfYear = (date: Date) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / MS_PER_DAY);
};

const utcSolarHour = (date: Date, location: SunLocation, rising: boolean): number | null => {
  const longitudeHour = location.longitude / 15;
  const solarDate = new Date(date.getTime() + longitudeHour * MS_PER_HOUR);
  const ordinalDay = dayOfYear(solarDate);
  const approximateTime = ordinalDay + ((rising ? 6 : 18) - longitudeHour) / HOURS_IN_DAY;
  const meanAnomaly = 0.9856 * approximateTime - 3.289;
  const trueLongitude = normalizeDegrees(
    meanAnomaly + 1.916 * Math.sin(toRadians(meanAnomaly)) + 0.02 * Math.sin(toRadians(2 * meanAnomaly)) + 282.634
  );
  const rightAscension = normalizeDegrees(toDegrees(Math.atan(0.91764 * Math.tan(toRadians(trueLongitude)))));
  const longitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
  const rightAscensionQuadrant = Math.floor(rightAscension / 90) * 90;
  const adjustedRightAscension = (rightAscension + longitudeQuadrant - rightAscensionQuadrant) / 15;
  const sineDeclination = 0.39782 * Math.sin(toRadians(trueLongitude));
  const cosineDeclination = Math.cos(Math.asin(sineDeclination));
  const cosineHourAngle =
    (Math.cos(toRadians(SUN_ZENITH)) - sineDeclination * Math.sin(toRadians(location.latitude))) /
    (cosineDeclination * Math.cos(toRadians(location.latitude)));

  if (cosineHourAngle > 1 || cosineHourAngle < -1) return null;

  const hourAngle = rising ? 360 - toDegrees(Math.acos(cosineHourAngle)) : toDegrees(Math.acos(cosineHourAngle));
  const localMeanTime = hourAngle / 15 + adjustedRightAscension - 0.06571 * approximateTime - 6.622;
  return normalizeHours(localMeanTime - longitudeHour);
};

export const getSolarTheme = (date = new Date(), location: SunLocation = DEFAULT_SUN_LOCATION): ColorTheme => {
  const sunriseUtc = utcSolarHour(date, location, true);
  const sunsetUtc = utcSolarHour(date, location, false);

  // Polar day/night has no ordinary sunrise or sunset. Keep a safe civil-time fallback there.
  if (sunriseUtc === null || sunsetUtc === null) return getCivilTimeTheme(date);

  const longitudeHour = location.longitude / 15;
  const currentSolarHour = normalizeHours(date.getUTCHours() + date.getUTCMinutes() / MINUTES_IN_HOUR + longitudeHour);
  const sunriseSolarHour = normalizeHours(sunriseUtc + longitudeHour);
  const sunsetSolarHour = normalizeHours(sunsetUtc + longitudeHour);
  const isDaylight =
    sunriseSolarHour < sunsetSolarHour
      ? currentSolarHour >= sunriseSolarHour && currentSolarHour < sunsetSolarHour
      : currentSolarHour >= sunriseSolarHour || currentSolarHour < sunsetSolarHour;

  return isDaylight ? 'light' : 'dark';
};

const getCivilTimeTheme = (date = new Date()): ColorTheme => {
  const hour = date.getHours();
  return hour >= CIVIL_DAYLIGHT_START_HOUR && hour < CIVIL_DAYLIGHT_END_HOUR ? 'light' : 'dark';
};

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

export const getGrantedSunLocation = async (): Promise<SunLocation | null> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation || !navigator.permissions?.query) return null;

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state !== 'granted') return null;
  } catch {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        resolve(isSunLocation(location) ? location : null);
      },
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: MS_PER_DAY, timeout: 2_000 }
    );
  });
};

// SYNC CONTRACT: Keep solarTheme() logic in sync with getSolarTheme() / getCivilTimeTheme() above.
// Must remain a self-contained IIFE template string (no module imports) for <Script strategy="beforeInteractive">.
export const createThemeInitializerScript = (): string => `(() => {
  document.documentElement.lang = /^\\/en(?:\\/|$)/.test(window.location.pathname) ? 'en' : 'zh-CN';
  const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  const solarTheme = () => {
    const latitude = ${DEFAULT_SUN_LOCATION.latitude};
    const longitude = ${DEFAULT_SUN_LOCATION.longitude};
    const radians = Math.PI / 180;
    const normalizeHours = (hours) => ((hours % ${HOURS_IN_DAY}) + ${HOURS_IN_DAY}) % ${HOURS_IN_DAY};
    const normalizeDegrees = (degrees) => ((degrees % ${DEGREES_IN_CIRCLE}) + ${DEGREES_IN_CIRCLE}) % ${DEGREES_IN_CIRCLE};
    const now = new Date();
    const longitudeHour = longitude / 15;
    const solarDate = new Date(now.getTime() + longitudeHour * ${MS_PER_HOUR});
    const start = Date.UTC(solarDate.getUTCFullYear(), 0, 0);
    const current = Date.UTC(solarDate.getUTCFullYear(), solarDate.getUTCMonth(), solarDate.getUTCDate());
    const ordinalDay = Math.floor((current - start) / ${MS_PER_DAY});
    const solarHour = (rising) => {
      const approximateTime = ordinalDay + ((rising ? 6 : 18) - longitudeHour) / ${HOURS_IN_DAY};
      const meanAnomaly = 0.9856 * approximateTime - 3.289;
      const trueLongitude = normalizeDegrees(
        meanAnomaly +
          1.916 * Math.sin(meanAnomaly * radians) +
          0.02 * Math.sin(2 * meanAnomaly * radians) +
          282.634
      );
      const rightAscension = normalizeDegrees(Math.atan(0.91764 * Math.tan(trueLongitude * radians)) / radians);
      const longitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
      const rightAscensionQuadrant = Math.floor(rightAscension / 90) * 90;
      const adjustedRightAscension = (rightAscension + longitudeQuadrant - rightAscensionQuadrant) / 15;
      const sineDeclination = 0.39782 * Math.sin(trueLongitude * radians);
      const cosineDeclination = Math.cos(Math.asin(sineDeclination));
      const cosineHourAngle =
        (Math.cos(${SUN_ZENITH} * radians) - sineDeclination * Math.sin(latitude * radians)) /
        (cosineDeclination * Math.cos(latitude * radians));
      if (cosineHourAngle > 1 || cosineHourAngle < -1) return null;
      const hourAngle = rising
        ? ${DEGREES_IN_CIRCLE} - Math.acos(cosineHourAngle) / radians
        : Math.acos(cosineHourAngle) / radians;
      const localMeanTime = hourAngle / 15 + adjustedRightAscension - 0.06571 * approximateTime - 6.622;
      return normalizeHours(localMeanTime - longitudeHour);
    };
    const sunrise = solarHour(true);
    const sunset = solarHour(false);
    if (sunrise === null || sunset === null) {
      const hour = now.getHours();
      return hour >= ${CIVIL_DAYLIGHT_START_HOUR} && hour < ${CIVIL_DAYLIGHT_END_HOUR} ? 'light' : 'dark';
    }
    const currentSolarHour = normalizeHours(now.getUTCHours() + now.getUTCMinutes() / ${MINUTES_IN_HOUR} + longitudeHour);
    const sunriseSolarHour = normalizeHours(sunrise + longitudeHour);
    const sunsetSolarHour = normalizeHours(sunset + longitudeHour);
    const isDaylight = sunriseSolarHour < sunsetSolarHour
      ? currentSolarHour >= sunriseSolarHour && currentSolarHour < sunsetSolarHour
      : currentSolarHour >= sunriseSolarHour || currentSolarHour < sunsetSolarHour;
    return isDaylight ? 'light' : 'dark';
  };
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
