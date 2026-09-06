'use client';

import { SiteImage } from '../components/site-image';

import { brandContent } from '../../data/brand';
import { companyContent } from '../../data/company';
import { businessLines } from '../../data/site';
import { getBusinessHeroMedia, pageContent } from '../../data/page-content';

import { EvidenceList, ResearchTile, SiteShell } from '../components/index';

import { PageHero, BusinessCard, NotFoundPage } from './shared';

export const CompanyPage = () => (
  <SiteShell activePath="/company" className="company-overview">
    <PageHero content={pageContent.company.hero} />
    <ResearchTile tone="light" eyebrow="ABOUT ELEXVX" title="我们是谁？">
      <div className="company-introduction">
        {companyContent.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="company-belief">{companyContent.belief}</p>
      </div>
    </ResearchTile>
    {companyContent.sections.map((section, index) => (
      <ResearchTile
        key={section.title}
        tone="light"
        className={index === 0 ? 'company-history' : 'company-card-section'}
        title={section.title}
        description={section.description}
      >
        <div className="company-content-list">
          {section.items.map((item) => (
            <div className="company-content-row" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </ResearchTile>
    ))}
    <ResearchTile tone="light" title="统计数据">
      <dl className="company-stats">
        {companyContent.stats.map((stat) => (
          <div key={stat.title}>
            <dt>{stat.title}</dt>
            <dd>{stat.amount}</dd>
          </div>
        ))}
      </dl>
    </ResearchTile>
  </SiteShell>
);

export const BusinessPage = () => (
  <SiteShell activePath="/company">
    <PageHero content={pageContent.business.hero} />
    <section className="research-tile research-tile-light">
      <div className="business-grid">
        {businessLines.map((line) => (
          <BusinessCard line={line} key={line.slug} />
        ))}
      </div>
    </section>
  </SiteShell>
);

export const BusinessLinePage = ({ slug }: { slug: string }) => {
  const line = businessLines.find((item) => item.slug === slug);
  if (!line) return <NotFoundPage />;
  return (
    <SiteShell activePath="/company">
      <PageHero
        content={{
          eyebrow: line.englishTitle,
          title: line.title,
          description: line.summary,
          primaryAction: pageContent.businessLine.primaryAction,
          secondaryAction: pageContent.businessLine.secondaryAction,
          media: getBusinessHeroMedia(line.slug),
        }}
      />
      <ResearchTile {...pageContent.businessLine.detail}>
        <EvidenceList items={[...pageContent.businessLine.facts]} />
      </ResearchTile>
    </SiteShell>
  );
};

export const ContactPage = () => (
  <SiteShell activePath="/contact">
    <PageHero content={pageContent.contact.hero} />
    <ResearchTile {...pageContent.contact.message}>
      <EvidenceList onDark items={[...pageContent.contact.prompts]} />
    </ResearchTile>
  </SiteShell>
);

export const BrandPage = () => (
  <SiteShell activePath="/company" className="company-overview brand-overview">
    <PageHero content={pageContent.brand.hero} />
    <ResearchTile tone="light" title="核心视觉资产" description="官方提供的标准化商标文件，可根据场景选择合适版本。">
      <div className="brand-original-gallery">
        {[
          ['elexvx-logo.svg', 'Elexvx 品牌蓝主标志'],
          ['elexvx-logo-reverse.svg', 'Elexvx 反白标志'],
          ['elexvx-logo-black.svg', 'Elexvx 单色黑标志'],
        ].map(([file, label]) => (
          <figure key={file}>
            <div className={file.includes('reverse') ? 'brand-specimen brand-specimen-reverse' : 'brand-specimen'}>
              <SiteImage src={`/brand/original/${file}`} alt={label} />
            </div>
            <figcaption>{label}</figcaption>
          </figure>
        ))}
      </div>
    </ResearchTile>
    {brandContent.sections.map((section) => (
      <ResearchTile key={section.title} tone="parchment" title={section.title} description={section.description}>
        <div className="company-content-list">
          {section.items.map((item) => (
            <div className="company-content-row" key={item.title}>
              <h3>{item.title}</h3>
              <div>
                {item.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ResearchTile>
    ))}
    <ResearchTile tone="light" title="Logo 使用指南" description="请遵循以下守则以维护品牌一致性与完整性">
      <div className="company-content-list">
        {brandContent.rules.map((item) => (
          <div className="company-content-row" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </ResearchTile>
    <ResearchTile tone="parchment" title="法律声明">
      <div className="company-introduction">
        {brandContent.legal.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
    </ResearchTile>
  </SiteShell>
);
