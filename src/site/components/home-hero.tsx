'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { homeIntro } from '../../data/home-intro';
import { humiteLaunch } from '../../data/humite-launch.mjs';
import { homeContent } from '../../data/page-content';
import { useI18n } from '../providers/i18n-context';
import type { HeroLaunchConfig } from './hero-schedule';
import { HeroBackdrop, HeroReleasedContent, HeroWaitingStage, HomeReleaseSchedule } from './home-hero-stages';
import { LockIcon } from './inline-icons';
import { classNames } from './ui';
import { useHeroLaunchPhase } from './use-hero-launch-phase';

type HomeLaunchProviderProps = {
  children: ReactNode;
  /** Precomputed release state from SSR to keep static export and hydration aligned. */
  initialReleased?: boolean;
  /** Optional launch schedule override (primarily for tests or custom scenes). */
  launch?: HeroLaunchConfig;
  /** Test-only initial timestamp in milliseconds. */
  initialNowMs?: number;
  /** Test-only local timezone offset in minutes. */
  timeZoneOffsetMinutes?: number;
};

const HomeLaunchContext = createContext<(ReturnType<typeof useHeroLaunchPhase> & { launch: HeroLaunchConfig }) | null>(
  null
);

export const HomeLaunchProvider = ({
  children,
  initialReleased,
  launch = humiteLaunch,
  initialNowMs,
  timeZoneOffsetMinutes,
}: HomeLaunchProviderProps) => {
  const state = useHeroLaunchPhase({
    initialReleased,
    hasReleasedContent: !!homeIntro,
    launch,
    initialNowMs,
    timeZoneOffsetMinutes,
  });
  return <HomeLaunchContext.Provider value={{ ...state, launch }}>{children}</HomeLaunchContext.Provider>;
};

const useHomeLaunch = () => {
  const context = useContext(HomeLaunchContext);
  if (!context) throw new Error('The homepage launch sections require HomeLaunchProvider.');
  return context;
};

export const HomeHero = ({
  showAnnouncement = true,
  fallbackTitle = 'Elexvx',
}: {
  showAnnouncement?: boolean;
  fallbackTitle?: string;
}) => {
  const { t } = useI18n();
  const { phase, didRevealOnClient, launch, mounted, localTimeZone, snapshot } = useHomeLaunch();

  return (
    <section
      className={classNames('home-product-intro', `home-hero--${phase}`)}
      aria-label={t('产品介绍')}
      data-hero-phase={phase}
    >
      <HeroBackdrop />
      {phase !== 'released' && (
        <HeroWaitingStage
          launch={launch}
          snapshot={snapshot}
          mounted={mounted}
          exiting={phase === 'revealing'}
          localTimeZone={localTimeZone}
        />
      )}
      {phase !== 'waiting' &&
        (homeIntro ? (
          <HeroReleasedContent
            showAnnouncement={showAnnouncement}
            animateEntrance={didRevealOnClient}
            settling={phase === 'released' && didRevealOnClient}
          />
        ) : (
          <div className="home-product-intro-copy">
            <h1>{t(fallbackTitle)}</h1>
          </div>
        ))}
    </section>
  );
};

export const HomeProductsLaunch = ({ children, beforeLaunch }: { children: ReactNode; beforeLaunch?: ReactNode }) => {
  const { t } = useI18n();
  const { phase, launch, mounted, localTimeZone } = useHomeLaunch();
  if (phase !== 'waiting') return <>{homeIntro ? children : beforeLaunch}</>;
  if (beforeLaunch) return <>{beforeLaunch}</>;

  return (
    <section className="home-content-section home-products-section" id="products" aria-labelledby="products-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <h2 id="products-title">{t(homeContent.product.title)}</h2>
        </div>
        <div className="home-products-locked">
          <LockIcon className="home-products-lock-icon" />
          <p className="home-products-lock-message">{t('嘘，新品还在后台，到点就登场！')}</p>
          <HomeReleaseSchedule launch={launch} mounted={mounted} localTimeZone={localTimeZone} />
        </div>
      </div>
    </section>
  );
};
