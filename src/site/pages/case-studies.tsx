'use client';

import type { CaseStudy, CaseStudySummary } from '../../data/case-studies';
import { Eyebrow } from '../components/index';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { ArticleCard } from '../components/article-card';
import { useI18n } from '../providers/i18n';
import { SiteShell } from '../components/shell';

const localizedCase = (item: CaseStudy, locale: 'zh-CN' | 'en') => ({
  title: locale === 'en' ? item.titleEn : item.title,
  excerpt: locale === 'en' ? item.excerptEn : item.excerpt,
  category: locale === 'en' ? item.categoryEn : item.category,
  body: locale === 'en' ? item.bodyEn : item.body,
});

const localizedCaseSummary = (item: CaseStudySummary, locale: 'zh-CN' | 'en') => ({
  title: locale === 'en' ? item.titleEn : item.title,
  excerpt: locale === 'en' ? item.excerptEn : item.excerpt,
  category: locale === 'en' ? item.categoryEn : item.category,
});

export const CaseStudyCard = ({ item }: { item: CaseStudySummary }) => {
  const { locale } = useI18n();
  const copy = localizedCaseSummary(item, locale);
  return (
    <ArticleCard
      className="home-case-card"
      cover={item.cover}
      category={copy.category}
      publishedAt={item.publishedAt}
      title={copy.title}
      excerpt={copy.excerpt}
      href={`/cases/${item.slug}`}
    />
  );
};

export const CaseStudyPage = ({ item, related }: { item: CaseStudy; related: CaseStudySummary[] }) => {
  const { locale, href } = useI18n();
  const copy = localizedCase(item, locale);
  return (
    <SiteShell activePath="/" className="site-shell-case-study">
      <article className="article-layout article-layout-case-study">
        <header className="article-header">
          <div className="article-kicker">
            <time dateTime={item.publishedAt}>{item.publishedAt}</time>
            <Eyebrow>{copy.category}</Eyebrow>
          </div>
          <h1>{copy.title}</h1>
          <p className="article-excerpt">{copy.excerpt}</p>
          <div className="article-meta">{item.author}</div>
        </header>
        <ArticleBody source={copy.body}>
          <ArticleMetadata author={item.author} keywords={item.keywords} keywordsEn={item.keywordsEn} />
        </ArticleBody>
        <div className="article-evidence">
          <Eyebrow>{locale === 'en' ? 'CASE STUDY' : '合作案例'}</Eyebrow>
          <span>{locale === 'en' ? 'Publishing systems' : '出版数字化'}</span>
          <a href={href('/')}>{locale === 'en' ? 'Back to home' : '返回首页'}</a>
        </div>
        <ContinueReading items={related} current={item} base="/cases" />
      </article>
    </SiteShell>
  );
};
