'use client';
import { LocalizedText as T, LocalizedTitle as Title, Translated, useI18n } from '../providers/i18n';

import { SiteImage } from '../components/site-image';
import { HomeHero, HomeLaunchProvider, HomeProductsLaunch } from '../components/home-hero';
import { homeBrands } from '../../data/home-intro';

import { ActivitySection } from './activities';
import { CaseStudyCard } from './case-studies';
import { homeContent } from '../../data/page-content';
import { usePublishedNews } from '../providers/content-context';
import type { NewsSummary } from '../../content/types';
import type { ActivitySummary } from '../../data/activities';
import type { CaseStudySummary } from '../../data/case-studies';
import { Eyebrow, SiteShell, TextLink } from '../components/index';

import { HomeEmptyContent } from './shared';
import { ArticleCard, NewsCard } from '../components/article-card';

export const HomeWelcomeRest = ({ items }: { items: ActivitySummary[] }) => {
  const { hero } = homeContent;
  const { t } = useI18n();
  return (
    <>
      <section className="home-ecosystem" aria-labelledby="home-ecosystem-title">
        <div className="home-ecosystem-inner">
          <h2 id="home-ecosystem-title">
            <Title text={hero.title} />
          </h2>
          <p className="home-ecosystem-description">
            <T text={hero.description} />
          </p>
          <ul className="home-partner-grid" aria-label={t('生态合作伙伴')}>
            {homeBrands.map((brand) => {
              const { src, darkSrc, width, height, format } = brand.logo;
              return (
                <li key={brand.name}>
                  <span
                    className="home-brand-mark"
                    data-brand={brand.name}
                    data-format={format}
                    data-colorful={brand.colorful || undefined}
                    role="img"
                    aria-label={t(brand.name)}
                  >
                    <SiteImage
                      className={darkSrc ? 'home-brand-light' : undefined}
                      src={src}
                      alt=""
                      width={width}
                      height={height}
                    />
                    {darkSrc && (
                      <SiteImage className="home-brand-dark" src={darkSrc} alt="" width={width} height={height} />
                    )}
                    {brand.showName && <span>{t(brand.name)}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          <small className="home-partner-caption" role="note">
            <span aria-hidden="true">* </span>
            <T text="以上均为生态合作伙伴" />
          </small>
        </div>
      </section>
      <ActivitySection items={items} />
    </>
  );
};

const HomeWelcome = ({ items }: { items: ActivitySummary[] }) => (
  <section className="home-welcome">
    <div className="home-welcome-inner">
      <HomeHero />
      <HomeWelcomeRest items={items} />
    </div>
  </section>
);

const HomeNewsSection = ({ news }: { news: NewsSummary[] }) => {
  const content = homeContent.news;
  return (
    <section
      className="home-content-section home-content-section-alt home-news-section"
      id="news"
      aria-labelledby="news-title"
    >
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>
              <Translated>{content.eyebrow}</Translated>
            </Eyebrow>
            <h2 id="news-title">
              <Title text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>查看更多</TextLink>
        </div>
        <div className="home-news-grid">
          {news.map((item) => (
            <NewsCard item={item} key={item.slug} showExcerpt={false} />
          ))}
          {!news.length && <HomeEmptyContent />}
        </div>
      </div>
    </section>
  );
};

const HomeCasesSection = ({ items }: { items: CaseStudySummary[] }) => {
  const content = homeContent.cases;
  const caseStudy = items[0];
  return (
    <section className="home-content-section" id="cooperation-cases" aria-labelledby="cooperation-cases-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>
              <Translated>{content.eyebrow}</Translated>
            </Eyebrow>
            <h2 id="cooperation-cases-title">
              <Title text={content.title} />
            </h2>
          </div>
          {caseStudy && (
            <TextLink href={content.action.href}>
              <Translated>{content.action.label}</Translated>
            </TextLink>
          )}
        </div>
        {caseStudy ? (
          <div className="home-media-grid home-case-grid">
            <CaseStudyCard item={caseStudy} />
          </div>
        ) : (
          <HomeEmptyContent />
        )}
      </div>
    </section>
  );
};

const HomeResearchSection = ({ items }: { items: ActivitySummary[] }) => {
  const papers = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
  return (
    <section className="home-content-section home-products-section" id="research" aria-labelledby="home-research-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <h2 id="home-research-title">
            <Title text="研究" />
          </h2>
          <TextLink href="/research">查看更多</TextLink>
        </div>
        <div className="home-media-grid home-products-grid">
          {papers.map((paper) => (
            <ArticleCard
              key={paper.slug}
              variant="feature"
              href={`/research/${paper.slug}`}
              title={paper.title}
              cover={paper.cover}
              category={paper.category || '研究'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomeProductsSection = () => {
  const { t } = useI18n();
  const content = homeContent.product;
  return (
    <section className="home-content-section home-products-section" id="products" aria-labelledby="products-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>
              <Translated>{content.eyebrow}</Translated>
            </Eyebrow>
            <h2 id="products-title">
              <Title text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>查看更多</TextLink>
        </div>
        <div className="home-media-grid home-products-grid">
          {content.items
            .map((product) => (
              <ArticleCard
                key={product.slug}
                variant="feature"
                href={product.href}
                title={product.name}
                cover={product.image}
                category={product.category}
                excerpt={product.description}
                imageLinkLabel={`${product.name} · ${t(product.category)} · ${t(product.description)}`}
              />
            ))}
        </div>
      </div>
    </section>
  );
};

const HomeCompanyEntry = () => {
  const { t, href } = useI18n();
  const content = homeContent.closing;
  return (
    <section className="home-company-section" aria-labelledby="home-company-title">
      <div className="home-company-inner">
        <h2 id="home-company-title">
          <Title text={content.title} />
        </h2>
        <a className="home-company-cta" href={href(content.action.href)}>
          {t(content.action.label)}
        </a>
      </div>
    </section>
  );
};

type HomeContentProps = {
  activities: ActivitySummary[];
  research: ActivitySummary[];
  caseStudies: CaseStudySummary[];
};

export const HomeNewsAndResearch = ({ research }: Pick<HomeContentProps, 'research'>) => {
  const news = [...usePublishedNews()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 6);
  return (
    <>
      <HomeNewsSection news={news} />
      <HomeResearchSection items={research} />
    </>
  );
};

export const HomeCasesAndCompany = ({ caseStudies }: Pick<HomeContentProps, 'caseStudies'>) => (
  <>
    <HomeCasesSection items={caseStudies} />
    <HomeCompanyEntry />
  </>
);

const HomeContent = ({ activities, research, caseStudies }: HomeContentProps) => (
  <HomeLaunchProvider>
    <HomeWelcome items={activities} />
    <HomeNewsAndResearch research={research} />
    <HomeProductsLaunch>
      <HomeProductsSection />
    </HomeProductsLaunch>
    <HomeCasesAndCompany caseStudies={caseStudies} />
  </HomeLaunchProvider>
);

export const HomePage = (props: HomeContentProps) => (
  <SiteShell activePath="/" navTone="dark" className="site-shell-home">
    <HomeContent {...props} />
  </SiteShell>
);
