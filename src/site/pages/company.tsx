'use client';
import { Translated } from '../providers/i18n';
import { CompanyIntro } from '../components/company-intro';

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
          <p key={paragraph}>
            <Translated>{paragraph}</Translated>
          </p>
        ))}
        <p className="company-belief">
          <Translated>{companyContent.belief}</Translated>
        </p>
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
              <h3>
                <Translated>{item.title}</Translated>
              </h3>
              <p>
                <Translated>{item.description}</Translated>
              </p>
            </div>
          ))}
        </div>
      </ResearchTile>
    ))}
    <ResearchTile tone="light" title="统计数据">
      <dl className="company-stats">
        {companyContent.stats.map((stat) => (
          <div key={stat.title}>
            <dt>
              <Translated>{stat.title}</Translated>
            </dt>
            <dd>
              <Translated>{stat.amount}</Translated>
            </dd>
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
    <section className="team-page contact-page">
      <CompanyIntro
        eyebrow="ELEXVX CONTACT"
        title="联系我们"
        description="从一个真实问题开始，让一次对话走向可验证的合作。"
      />
      <div className="contact-card-grid">
        <section className="contact-info-card">
          <span className="eyebrow">01 / VISIT</span>
          <h2>
            <Translated>{'企业地址'}</Translated>
          </h2>
          <p>
            <Translated>{'宏翔商道（南京）科技发展有限公司'}</Translated>
          </p>
          <p className="contact-detail">
            <Translated>{'详细地址待补充'}</Translated>
          </p>
          <p className="contact-note">
            <Translated>{'来访前请先通过邮件联系，方便安排交流。'}</Translated>
          </p>
        </section>
        <section className="contact-info-card">
          <span className="eyebrow">02 / CONTACT</span>
          <h2>
            <Translated>{'联系方式'}</Translated>
          </h2>
          <dl>
            <div>
              <dt>
                <Translated>{'联系邮箱'}</Translated>
              </dt>
              <dd>
                <a href="mailto:contact@elexvx.com">contact@elexvx.com ↗</a>
              </dd>
            </div>
            <div>
              <dt>
                <Translated>{'联系电话'}</Translated>
              </dt>
              <dd>
                <Translated>{'待补充'}</Translated>
              </dd>
            </div>
          </dl>
          <p className="contact-note">
            <Translated>{'邮件中请留下姓名、联系方式与合作事项。'}</Translated>
          </p>
        </section>
        <section className="contact-info-card contact-wechat-card">
          <div>
            <span className="eyebrow">03 / WECHAT</span>
            <h2>
              <Translated>{'微信公众号'}</Translated>
            </h2>
            <p>
              <Translated>{'关注我们的研究、产品与企业动态。'}</Translated>
            </p>
          </div>
          <div className="contact-wechat-pending">
            <Translated>{'公众号名称与二维码待补充'}</Translated>
          </div>
        </section>
      </div>
    </section>
  </SiteShell>
);

export const BrandPage = () => (
  <SiteShell activePath="/company" className="company-overview brand-overview">
    <PageHero content={pageContent.brand.hero} />
    <ResearchTile tone="light" title="核心视觉资产" description="官方提供的标准化商标文件，可根据场景选择合适版本。">
      <div className="brand-original-gallery">
        {[
          ['elexvx-logo-305ccd7238.svg', 'Elexvx 品牌蓝主标志'],
          ['elexvx-logo-reverse-79454e6823.svg', 'Elexvx 反白标志'],
          ['elexvx-logo-black-2460d9206a.svg', 'Elexvx 单色黑标志'],
        ].map(([file, label]) => (
          <figure key={file}>
            <div className={file.includes('reverse') ? 'brand-specimen brand-specimen-reverse' : 'brand-specimen'}>
              <SiteImage src={`/brand/original/${file}`} alt={label} />
            </div>
            <figcaption>
              <Translated>{label}</Translated>
            </figcaption>
          </figure>
        ))}
      </div>
    </ResearchTile>
    {brandContent.sections.map((section) => (
      <ResearchTile key={section.title} tone="parchment" title={section.title} description={section.description}>
        <div className="company-content-list">
          {section.items.map((item) => (
            <div className="company-content-row" key={item.title}>
              <h3>
                <Translated>{item.title}</Translated>
              </h3>
              <div>
                {item.paragraphs.map((text) => (
                  <p key={text}>
                    <Translated>{text}</Translated>
                  </p>
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
            <h3>
              <Translated>{item.title}</Translated>
            </h3>
            <p>
              <Translated>{item.description}</Translated>
            </p>
          </div>
        ))}
      </div>
    </ResearchTile>
    <ResearchTile tone="parchment" title="法律声明">
      <div className="company-introduction">
        {brandContent.legal.map((text) => (
          <p key={text}>
            <Translated>{text}</Translated>
          </p>
        ))}
      </div>
    </ResearchTile>
  </SiteShell>
);
