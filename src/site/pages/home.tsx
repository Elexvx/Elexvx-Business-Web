'use client';
import { Translated } from '../providers/i18n';

import { SiteImage } from '../components/site-image';
import homeHeroInline from '../../data/home-hero-inline.json';

import { ActivitySection } from './activities';
import { CaseStudyCard } from './case-studies';
import { publishedResearch } from '../../data/research-articles';
import { publishedCaseStudies } from '../../data/case-studies';
import { researchDirections } from '../../data/site';
import { homeContent } from '../../data/page-content';
import { usePublishedNews } from '../providers/content-context';
import type { Insight, NewsItem } from '../../content/types';
import { Eyebrow, SiteShell, TextLink } from '../components/index';

import { LocalizedText as T, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { HomeDirectionCard, HomeInsightCard, NewsCard, HomeEmptyContent } from './shared';

export const isCompanyActivity = (item: NewsItem) =>
  ['活动', '公司活动', '最近活动', 'activity', 'event'].includes(item.category.toLowerCase()) ||
  item.tags.some((tag) => ['公司活动', 'activity', 'event'].includes(tag.toLowerCase()));

export const HomeLatestActivity = () => <ActivitySection />;

export const HomeWelcome = () => {
  const { hero } = homeContent;
  const important = hero.important.enabled && hero.important.title.trim() ? hero.important : null;
  const title = important?.title || hero.title;
  const description = important ? important.description : hero.description;
  const image = important?.image || hero.image;
  return (
    <section className="home-welcome">
      <div className="home-welcome-inner">
        <div className={`home-hero-banner${image ? ' has-image' : ''}`}>
          {image && (
            <SiteImage
              className="home-hero-background"
              src={image === '/visuals/research-gradient.jpg' ? homeHeroInline : image}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          )}
          <div className="home-hero-content">
            <h1>
              <T text={title} />
            </h1>
            {description && (
              <p className="home-welcome-description">
                <T text={description} />
              </p>
            )}
            {important?.action.href && important.action.label && (
              <TextLink href={important.action.href} showArrow={false}>
                <Translated>{important.action.label}</Translated>
              </TextLink>
            )}
          </div>
        </div>
        <HomeLatestActivity />
      </div>
    </section>
  );
};

export const HomeDirectionsSection = () => {
  const content = homeContent.directions;
  return (
    <section
      className="home-content-section home-directions-section"
      id="research-directions"
      aria-labelledby="research-directions-title"
    >
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>
              <Translated>{content.eyebrow}</Translated>
            </Eyebrow>
            <h2 id="research-directions-title">
              <Title text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>
            <Translated>{content.action.label}</Translated>
          </TextLink>
        </div>
        <div className="home-direction-grid">
          {researchDirections.map((direction, index) => (
            <HomeDirectionCard direction={direction} index={index} key={direction.slug} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomePublicationsSection = ({ insights }: { insights: Insight[] }) => {
  const content = homeContent.publications;
  return (
    <section className="home-content-section" id="research-publications" aria-labelledby="research-publications-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>
              <Translated>{content.eyebrow}</Translated>
            </Eyebrow>
            <h2 id="research-publications-title">
              <Title text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>
            <Translated>{content.action.label}</Translated>
          </TextLink>
        </div>
        {!insights.length && <HomeEmptyContent />}
        <div className="home-media-grid home-insight-grid">
          {insights.map((insight) => (
            <HomeInsightCard insight={insight} key={insight.slug} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomeNewsSection = ({ news }: { news: NewsItem[] }) => {
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
          <TextLink href={content.action.href} showArrow={false}>
            查看更多
          </TextLink>
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

export const HomeCasesSection = () => {
  const content = homeContent.cases;
  const caseStudy = publishedCaseStudies[0];
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
            <TextLink href={content.action.href} showArrow={false}>
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

export const HomeResearchSection = () => {
  const { t, href } = useI18n();
  const papers = [...publishedResearch].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
  return (
    <section className="home-content-section home-products-section" id="research" aria-labelledby="home-research-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <h2 id="home-research-title">
            <Title text="研究" />
          </h2>
          <TextLink href="/research" showArrow={false}>
            查看更多
          </TextLink>
        </div>
        <div className="home-media-grid home-products-grid">
          {papers.map((paper) => (
            <article className="home-product-feature" key={paper.slug}>
              <a className="home-product-media" href={href(`/research/${paper.slug}`)} aria-label={t(paper.title)}>
                <SiteImage
                  src={paper.cover || '/visuals/research-gradient.jpg'}
                  alt={t(paper.title)}
                  width={1600}
                  height={1600}
                  sizes="(max-width: 720px) 80vw, (max-width: 1024px) 45vw, 420px"
                />
              </a>
              <div className="home-media-card-body home-product-copy">
                <h3>
                  <a href={href(`/research/${paper.slug}`)}>{t(paper.title)}</a>
                </h3>
                <Eyebrow>{paper.category || '研究'}</Eyebrow>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomeProductsSection = () => {
  const { t, href } = useI18n();
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
          <TextLink href={content.action.href} showArrow={false}>
            查看更多
          </TextLink>
        </div>
        <div className="home-media-grid home-products-grid">
          {content.items.map((product) => (
            <article className="home-product-feature" key={product.name}>
              <a
                className="home-product-media"
                href={href(product.href)}
                aria-label={`${product.name} · ${t(product.category)} · ${t(product.description)}`}
              >
                <SiteImage
                  src={product.image}
                  alt={product.name}
                  width={1600}
                  height={1600}
                  sizes="(max-width: 720px) 80vw, (max-width: 1024px) 45vw, 420px"
                  loading="lazy"
                  decoding="async"
                />
              </a>

              <div className="home-media-card-body home-product-copy">
                <h3>
                  <Translated>{product.name}</Translated>
                </h3>
                <Eyebrow>
                  <Translated>{product.category}</Translated>
                </Eyebrow>
                <p>{t(product.description)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomeCompanyEntry = () => {
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

export const HomePage = () => {
  const news = [...usePublishedNews()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 6);
  return (
    <SiteShell activePath="/" navTone="dark" className="site-shell-home">
      <HomeWelcome />
      <HomeNewsSection news={news} />
      <HomeResearchSection />
      <HomeProductsSection />
      <HomeCasesSection />
      <HomeCompanyEntry />
    </SiteShell>
  );
};
