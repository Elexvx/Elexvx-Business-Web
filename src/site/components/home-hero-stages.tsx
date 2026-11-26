import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { homeIntro } from '../../data/home-intro';
import { homeContent } from '../../data/page-content';
import { LocalizedTitle, useI18n } from '../providers/i18n-context';
import { ShowcaseFrame } from './showcase-frame';
import {
  formatLocalReleaseTimestamp,
  formatReleaseTimestamp,
  type CountdownSnapshot,
  type HeroLaunchConfig,
} from './hero-schedule';
import { classNames } from './ui';
import { prefersReducedMotion } from './use-hero-launch-phase';

const DIGIT_TRANSITION_MS = 280;
const INITIAL_WAIT_PROGRESS = 0.12;
const PARTICLES_FALLBACK_DELAY_MS = 6500;

const HeroParticles = dynamic(() => import('./hero-particles').then((module) => module.HeroParticles), {
  ssr: false,
  loading: () => <canvas className="home-hero-particles" aria-hidden="true" />,
});

const HERO_WAIT_COPY = {
  title: '先卖个关子，精彩正在路上。',
  description: '还不到亮相的时候，但值得等这一会儿。',
} as const;

export const HeroBackdrop = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let fallbackTimer = 0;
    const interactionEvents = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'scroll'] as const;

    const cleanup = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = 0;
      }
      window.removeEventListener('load', scheduleFallback);
      for (const eventName of interactionEvents) {
        window.removeEventListener(eventName, activate);
      }
    };

    const activate = () => {
      cleanup();
      setActive(true);
    };

    const scheduleFallback = () => {
      if (fallbackTimer) return;
      fallbackTimer = window.setTimeout(activate, PARTICLES_FALLBACK_DELAY_MS);
    };

    for (const eventName of interactionEvents) {
      window.addEventListener(eventName, activate, { once: true, passive: true });
    }
    if (document.readyState === 'complete') {
      scheduleFallback();
    } else {
      window.addEventListener('load', scheduleFallback, { once: true });
    }

    return cleanup;
  }, []);

  return (
    <div className="home-hero-backdrop" aria-hidden="true">
      {active ? <HeroParticles /> : <canvas className="home-hero-particles" aria-hidden="true" />}
    </div>
  );
};

const padUnit = (value: number) => String(value).padStart(2, '0');

const RollingDigit = ({ digit }: { digit: string }) => {
  const [state, setState] = useState<{ current: string; previous: string | null; tick: number }>({
    current: digit,
    previous: null,
    tick: 0,
  });

  useEffect(() => {
    if (digit === state.current) return;
    setState((prev) => ({
      current: digit,
      previous: prefersReducedMotion() || prev.current === '-' || digit === '-' ? null : prev.current,
      tick: prev.tick + 1,
    }));
  }, [digit, state.current]);

  useEffect(() => {
    if (state.previous === null) return;
    const timer = window.setTimeout(() => {
      setState((prev) => (prev.previous === null ? prev : { ...prev, previous: null }));
    }, DIGIT_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [state.previous, state.tick]);

  return (
    <span className="home-digit-slot">
      {state.previous !== null && (
        <span key={`out-${state.tick}`} className="home-digit-glyph is-leaving" aria-hidden="true">
          {state.previous}
        </span>
      )}
      <span
        key={state.tick > 0 ? `in-${state.tick}` : 'initial'}
        className={classNames('home-digit-glyph', state.previous !== null && 'is-entering')}
      >
        {state.current}
      </span>
    </span>
  );
};

export const HeroReleasedContent = ({
  showAnnouncement,
  animateEntrance,
  settling,
}: {
  showAnnouncement: boolean;
  animateEntrance: boolean;
  settling?: boolean;
}) => {
  const { hero } = homeContent;
  const { t, href } = useI18n();
  if (!homeIntro) return null;
  const important = showAnnouncement && hero.important.enabled && hero.important.title.trim() ? hero.important : null;
  const rawActionHref = important?.action.href || homeIntro.actionHref;
  const isExternalAction = /^https?:\/\//.test(rawActionHref);
  const resolvedActionHref = isExternalAction ? rawActionHref : href(rawActionHref);

  return (
    <div className={classNames('home-hero-released', animateEntrance && 'is-revealing', settling && 'is-settled')}>
      {animateEntrance && <div className="home-hero-reveal-flash" aria-hidden="true" />}
      <div className="home-product-intro-copy">
        <a
          className="home-release-link"
          href={important?.action.href ? href(important.action.href) : '#humite-preview'}
        >
          <span className="home-release-badge">{t(important ? '动态更新' : '新')}</span>
          <span>{t(important?.action.label || homeIntro.release)}</span>
        </a>
        <h1>
          <LocalizedTitle text={important?.title || homeIntro.title} />
        </h1>
        <p className="home-product-description">{t(important?.description || homeIntro.description)}</p>
        <a
          className="action-button action-button-secondary home-product-action"
          href={resolvedActionHref}
          target={isExternalAction ? '_blank' : undefined}
          rel={isExternalAction ? 'noopener' : undefined}
        >
          {t(important?.action.label || homeIntro.action)}
        </a>
      </div>
      <div className="home-mac-preview" id="humite-preview">
        <ShowcaseFrame
          src={homeIntro.showcase.path}
          title={t(homeIntro.showcase.title)}
          previewImage={homeIntro.showcase.previewImage}
        />
      </div>
    </div>
  );
};

type HomeReleaseScheduleProps = {
  launch: HeroLaunchConfig;
  mounted: boolean;
  localTimeZone: { offsetMinutes: number; name?: string } | null;
};

export const HomeReleaseSchedule = ({ launch, mounted, localTimeZone }: HomeReleaseScheduleProps) => {
  const formattedTime =
    mounted && localTimeZone
      ? formatLocalReleaseTimestamp(launch.releaseAt, localTimeZone.offsetMinutes)
      : formatReleaseTimestamp(launch.releaseAt);
  if (!formattedTime) return null;

  return (
    <p className="home-hero-wait-schedule">
      <time dateTime={launch.releaseAt} title={localTimeZone?.name}>
        {formattedTime}
      </time>
    </p>
  );
};

export const HeroWaitingStage = ({
  launch,
  snapshot,
  mounted,
  exiting,
  localTimeZone,
}: HomeReleaseScheduleProps & { snapshot: CountdownSnapshot; exiting: boolean }) => {
  const { t } = useI18n();
  const units = [
    { key: 'days', value: mounted ? padUnit(snapshot.days) : '--', label: t('天') },
    { key: 'hours', value: mounted ? padUnit(snapshot.hours) : '--', label: t('时') },
    { key: 'minutes', value: mounted ? padUnit(snapshot.minutes) : '--', label: t('分') },
    { key: 'seconds', value: mounted ? padUnit(snapshot.seconds) : '--', label: t('秒') },
  ];

  const progress = mounted ? snapshot.progress : INITIAL_WAIT_PROGRESS;

  return (
    <div className={classNames('home-hero-wait', exiting && 'is-exiting')} aria-hidden={exiting || undefined}>
      <div className="home-product-intro-copy home-hero-wait-copy">
        {exiting ? (
          <p className="home-hero-wait-title-exit">
            <LocalizedTitle text={HERO_WAIT_COPY.title} />
          </p>
        ) : (
          <h1>
            <LocalizedTitle text={HERO_WAIT_COPY.title} />
          </h1>
        )}

        <p className="home-product-description">{t(HERO_WAIT_COPY.description)}</p>

        <div className="home-countdown" role="timer" aria-label={t('发布倒计时')}>
          {units.map((unit, index) => (
            <div className="home-countdown-group" key={unit.key}>
              {index > 0 && (
                <span className="home-countdown-sep" aria-hidden="true">
                  :
                </span>
              )}
              <div className="home-countdown-unit">
                <span className="sr-only">{unit.value}</span>
                <span className="home-countdown-value" aria-hidden="true">
                  {unit.value.split('').map((digit, digitIndex) => (
                    <RollingDigit key={`${unit.key}-${unit.value.length - digitIndex}`} digit={digit} />
                  ))}
                </span>
                <span className="home-countdown-label">{unit.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="home-hero-wait-meta">
          <div className="home-hero-wait-track" aria-hidden="true">
            <span className="home-hero-wait-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <HomeReleaseSchedule launch={launch} mounted={mounted} localTimeZone={localTimeZone} />
        </div>
      </div>
    </div>
  );
};
