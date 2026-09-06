'use client';

import { SiteImage } from './site-image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useI18n } from '../providers/i18n';

type ReadingItem = {
  slug: string;
  title: string;
  publishedAt: string;
  cover?: string;
  category?: string;
  status: string;
};

export const ArticleBody = ({ source, children }: { source: string; children?: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState('article-content');
  const { locale } = useI18n();
  useEffect(() => {
    const nodes = Array.from(ref.current?.querySelectorAll('h1,h2,h3') || []);
    const entries = nodes.map((node, i) => {
      node.id = `article-section-${i + 1}`;
      return { id: node.id, text: node.textContent || '' };
    });
    setHeadings(entries);
    const update = () => {
      let id = entries[0]?.id || 'article-content';
      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top <= 150) id = node.id;
      });
      setActive(id);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    const hash = window.location.hash.slice(1);
    if (entries.some((entry) => entry.id === hash)) document.getElementById(hash)?.scrollIntoView();
    return () => window.removeEventListener('scroll', update);
  }, [source, locale]);
  return (
    <div className="article-reading-layout">
      <aside className="article-toc">
        <nav aria-label={locale === 'en' ? 'Table of contents' : '文章目录'}>
          <p>{locale === 'en' ? 'Contents' : '目录'}</p>
          {(headings.length ? headings : [{ id: 'article-content', text: locale === 'en' ? 'Article' : '正文' }]).map(
            (entry) => (
              <a key={entry.id} href={`#${entry.id}`} aria-current={active === entry.id ? 'location' : undefined}>
                {entry.text}
              </a>
            )
          )}
        </nav>
      </aside>
      <div className="article-body" id="article-content" ref={ref}>
        <MarkdownRenderer source={source} />
        {children}
      </div>
    </div>
  );
};

export const ContinueReading = ({
  items,
  current,
  base,
}: {
  items: ReadingItem[];
  current: ReadingItem;
  base: string;
}) => {
  const { href, t, locale } = useI18n();
  const related = items
    .filter((item) => item.status === 'published' && item.slug !== current.slug)
    .sort(
      (a, b) =>
        Number(b.category === current.category) - Number(a.category === current.category) ||
        b.publishedAt.localeCompare(a.publishedAt)
    )
    .slice(0, 3);
  if (!related.length) return null;
  return (
    <section className="article-continue" aria-label={locale === 'en' ? 'Continue reading' : '继续阅读'}>
      <div className="home-section-topline">
        <h2>{locale === 'en' ? 'Continue reading' : '继续阅读'}</h2>
        <a className="text-link" href={href(base)}>
          {locale === 'en' ? 'View more' : '查看更多'}
        </a>
      </div>
      <div className="article-continue-grid">
        {related.map((item) => (
          <a key={item.slug} href={href(`${base}/${item.slug}`)}>
            <SiteImage src={item.cover || '/visuals/research-gradient.jpg'} alt={t(item.title)} loading="lazy" />
            <h3>{t(item.title)}</h3>
            <p>
              {item.category && <span>{t(item.category)} · </span>}
              <time dateTime={item.publishedAt}>{item.publishedAt}</time>
            </p>
          </a>
        ))}
      </div>
    </section>
  );
};
