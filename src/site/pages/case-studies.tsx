'use client';

import { publishedCaseStudies, type CaseStudy } from '../../data/case-studies';
import { Eyebrow } from '../components/index';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { HomeMediaCard, NotFoundPage } from './shared';
import { useI18n } from '../providers/i18n';
import { SiteShell } from '../components/shell';

const localizedCase = (item: CaseStudy, locale: 'zh-CN' | 'en') => ({
  title: locale === 'en' ? item.titleEn : item.title,
  excerpt: locale === 'en' ? item.excerptEn : item.excerpt,
  category: locale === 'en' ? item.categoryEn : item.category,
  body: locale === 'en' ? item.bodyEn : item.body,
});

export const CaseStudyCard = ({ item }: { item: CaseStudy }) => {
  const { locale } = useI18n();
  const copy = localizedCase(item, locale);
  return (
    <HomeMediaCard
      className="home-case-card"
      image={item.cover}
      imageAlt={copy.title}
      eyebrow={`${copy.category} · ${item.publishedAt}`}
      title={copy.title}
      description={copy.excerpt}
      naturalTitle
      href={`/cases/${item.slug}`}
    />
  );
};

export const CaseStudyPage = ({ slug }: { slug: string }) => {
  const { locale, href } = useI18n();
  const item = publishedCaseStudies.find((entry) => entry.slug === slug);
  if (!item) return <NotFoundPage />;
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
          <Eyebrow>CASE STUDY</Eyebrow>
          <span>{locale === 'en' ? 'Publishing systems' : '出版数字化'}</span>
          <a href={href('/')}>{locale === 'en' ? '← Back to home' : '← 返回首页'}</a>
        </div>
        <ContinueReading items={publishedCaseStudies} current={item} base="/cases" />
      </article>
    </SiteShell>
  );
};
