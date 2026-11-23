import { useEffect, useState } from 'react';

import {
  getCountdownSnapshot,
  isReleaseReached,
  parseReleaseTimestamp,
  type CountdownSnapshot,
  type HeroLaunchConfig,
} from './hero-schedule';

export type HeroPhase = 'waiting' | 'revealing' | 'released';

const REVEAL_DURATION_MS = 950;
const COUNTDOWN_TICK_INTERVAL_MS = 1000;
const MAX_TIMEOUT_MS = 2_147_483_647;

const UNMOUNTED_COUNTDOWN_SNAPSHOT: CountdownSnapshot = {
  released: false,
  remainingMs: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  progress: 0.12,
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useHeroLaunchPhase({
  initialReleased,
  hasReleasedContent,
  launch,
  initialNowMs,
  timeZoneOffsetMinutes,
}: {
  initialReleased?: boolean;
  hasReleasedContent: boolean;
  launch: HeroLaunchConfig;
  initialNowMs?: number;
  timeZoneOffsetMinutes?: number;
}) {
  const initialIsReleased =
    initialReleased ??
    (initialNowMs !== undefined
      ? isReleaseReached(launch, initialNowMs)
      : !launch.enabled || parseReleaseTimestamp(launch.releaseAt) === null);

  const [phase, setPhase] = useState<HeroPhase>(initialIsReleased ? 'released' : 'waiting');
  const [didRevealOnClient, setDidRevealOnClient] = useState(false);
  const [mounted, setMounted] = useState(initialNowMs !== undefined);
  const [localTimeZone, setLocalTimeZone] = useState<{ offsetMinutes: number; name?: string } | null>(
    typeof timeZoneOffsetMinutes === 'number' ? { offsetMinutes: timeZoneOffsetMinutes } : null
  );
  const [snapshot, setSnapshot] = useState<CountdownSnapshot>(() =>
    initialNowMs !== undefined ? getCountdownSnapshot(launch.releaseAt, initialNowMs) : UNMOUNTED_COUNTDOWN_SNAPSHOT
  );

  useEffect(() => {
    const releaseTimestamp = parseReleaseTimestamp(launch.releaseAt);
    if (initialIsReleased || !launch.enabled || releaseTimestamp === null) {
      setPhase('released');
      return;
    }

    if (typeof timeZoneOffsetMinutes !== 'number') {
      const offsetMinutes = -new Date(releaseTimestamp).getTimezoneOffset();
      let name: string | undefined;
      try {
        name = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        name = undefined;
      }
      setLocalTimeZone({ offsetMinutes, name });
    }

    const timers: { interval?: number; timeout?: number; reveal?: number } = {};

    const clearSchedules = () => {
      if (timers.interval !== undefined) window.clearInterval(timers.interval);
      if (timers.timeout !== undefined) window.clearTimeout(timers.timeout);
    };

    const triggerReveal = () => {
      clearSchedules();
      setSnapshot(getCountdownSnapshot(launch.releaseAt, Date.now()));
      setMounted(true);
      if (!hasReleasedContent || prefersReducedMotion()) {
        setPhase('released');
        return;
      }

      setDidRevealOnClient(true);
      setPhase('revealing');
      timers.reveal = window.setTimeout(() => {
        setPhase('released');
      }, REVEAL_DURATION_MS);
    };

    const sync = () => {
      const now = Date.now();
      const next = getCountdownSnapshot(launch.releaseAt, now);
      setSnapshot(next);
      setMounted(true);

      if (next.released) {
        triggerReveal();
        return true;
      }
      return false;
    };

    if (!isReleaseReached(launch, Date.now())) {
      setDidRevealOnClient(false);
      setPhase('waiting');
    }

    if (sync()) {
      return () => {
        if (timers.reveal !== undefined) window.clearTimeout(timers.reveal);
      };
    }

    const remaining = Math.max(0, releaseTimestamp - Date.now());
    if (remaining <= MAX_TIMEOUT_MS) {
      timers.timeout = window.setTimeout(sync, remaining);
    }
    timers.interval = window.setInterval(sync, COUNTDOWN_TICK_INTERVAL_MS);

    return () => {
      clearSchedules();
      if (timers.reveal !== undefined) window.clearTimeout(timers.reveal);
    };
  }, [hasReleasedContent, initialIsReleased, launch, timeZoneOffsetMinutes]);

  return { phase, didRevealOnClient, mounted, localTimeZone, snapshot };
}
