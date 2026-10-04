'use client';
import { useState } from 'react';
import { Translated, useI18n } from '../providers/i18n';
import { CompanyIntro } from '../components/company-intro';

import { SiteImage } from '../components/site-image';

import { brandContent } from '../../data/brand';
import { companyContent } from '../../data/company';
import { contactOffices, departmentContactEmails, primaryContactEmail } from '../../data/contact';
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

export const ContactPage = () => {
  const { t } = useI18n();
  const [copyStatus, setCopyStatus] = useState<{ email: string; result: 'copied' | 'failed' } | null>(null);

  const copyEmail = async (email: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        throw new Error('Clipboard unavailable');
      }
      setCopyStatus({ email, result: 'copied' });
    } catch {
      setCopyStatus({ email, result: 'failed' });
    }
  };

  return (
    <SiteShell activePath="/contact">
      <section className="team-page contact-page">
        <CompanyIntro
          eyebrow="ELEXVX CONTACT"
          title="联系我们"
          description="从一个真实问题开始，让一次对话走向可验证的合作。"
        />
        <section className="contact-section" aria-labelledby="contact-departments-title">
          <div className="contact-section-heading">
            <span className="eyebrow">ELEXVX / EMAIL</span>
            <h2 id="contact-departments-title">
              <Translated>{'部门邮箱'}</Translated>
            </h2>
            <p className="contact-note">
              <Translated>{'邮件中请留下姓名、联系方式与合作事项。'}</Translated>
            </p>
          </div>
          <div className="contact-email-grid">
            {departmentContactEmails.map((contact) => {
              const isPrimary = contact.email === primaryContactEmail;
              return (
                <article
                  className={`contact-email-card${isPrimary ? ' contact-email-card-primary' : ''}`}
                  key={contact.id}
                >
                  <div className="contact-email-card-heading">
                    {isPrimary && (
                      <span className="contact-primary-label">
                        <Translated>{'主要联系邮箱'}</Translated>
                      </span>
                    )}
                    <h3>
                      <Translated>{contact.department}</Translated>
                    </h3>
                  </div>
                  <a className="contact-email-link" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                  <div className="contact-actions">
                    {isPrimary && (
                      <a className="contact-email-button" href={`mailto:${primaryContactEmail}`}>
                        <Translated>{'发送邮件'}</Translated>
                      </a>
                    )}
                    <button
                      aria-label={`${t('复制邮箱地址')} ${t(contact.department)}: ${contact.email}`}
                      className="contact-copy-button"
                      type="button"
                      onClick={() => void copyEmail(contact.email)}
                    >
                      <Translated>{'复制邮箱地址'}</Translated>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="contact-copy-status" role="status" aria-live="polite" aria-atomic="true">
            {copyStatus && (
              <>
                <Translated>
                  {copyStatus.result === 'copied' ? '邮箱地址已复制。' : '复制失败，请手动复制邮箱地址。'}
                </Translated>{' '}
                <span>{copyStatus.email}</span>
              </>
            )}
          </p>
        </section>

        <section className="contact-section" aria-labelledby="contact-offices-title">
          <div className="contact-section-heading">
            <span className="eyebrow">ELEXVX / LOCATIONS</span>
            <h2 id="contact-offices-title">
              <Translated>{'办公地点'}</Translated>
            </h2>
          </div>
          <div className="contact-office-grid">
            {contactOffices.map((office) => (
              <article className="contact-office-card" key={office.id}>
                <div className="contact-office-heading">
                  <h3>
                    <Translated>{office.title}</Translated>
                  </h3>
                  {'organizationName' in office && office.organizationName && (
                    <p className="contact-office-organization">
                      <Translated>{office.organizationName}</Translated>
                    </p>
                  )}
                </div>
                <p className="contact-office-region">
                  <Translated>{office.region}</Translated>
                </p>
                <p className="contact-office-address">
                  <Translated>{office.address}</Translated>
                </p>
                <div className="contact-office-links">
                  <a href={office.mapHref} target="_blank" rel="noopener noreferrer">
                    <Translated>{'查看地图'}</Translated>
                    <span className="sr-only"> — {t(office.title)}</span>
                  </a>
                  <a href={office.businessCreditHref} target="_blank" rel="noopener noreferrer">
                    <Translated>{'企业信用'}</Translated>
                    <span className="sr-only"> — {t(office.title)}</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </SiteShell>
  );
};

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
