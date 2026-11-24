'use client';
import { Translated, useI18n } from '../providers/i18n';
import { CompanyIntro } from '../components/company-intro';

import { SiteImage } from '../components/site-image';

import { leadersData, serviceProviders, teamMembers, type TeamGroup } from '../../data/team';
import { SiteShell } from '../components/index';
import { NotFoundPage } from './shared';

const teamGroups = [
  { id: 'executive', zh: '执行团队', en: 'Executive Team' },
  { id: 'partners', zh: '合作伙伴', en: 'Partners' },
] as const satisfies ReadonlyArray<{ id: TeamGroup; zh: string; en: string }>;

export const TeamPage = () => {
  const { href, locale } = useI18n();
  return (
    <SiteShell activePath="/company">
      <section className="team-page">
        <CompanyIntro eyebrow="ELEXVX TEAM" title="团队" description="研究、工程与现场经验，在同一个问题上相遇。" />
        {teamGroups.map(({ id, zh, en }, groupIndex) => {
          const members = teamMembers.filter((member) => member.group === id);
          const headingId = `team-${id}`;

          return (
            <section className="team-group" aria-labelledby={headingId} key={id}>
              <h2 id={headingId}>{locale === 'en' ? en : zh}</h2>
              <div className="team-grid">
                {members.map((member, index) => (
                  <a
                    className="team-card"
                    data-member={member.id}
                    href={href(`/company/team/${member.id}`)}
                    key={member.id}
                  >
                    <div className="team-portrait-stage">
                      <SiteImage
                        src={member.image}
                        alt={member.name}
                        sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 45vw, 440px"
                        loading={groupIndex === 0 && index < 3 ? 'eager' : 'lazy'}
                        fetchPriority={groupIndex === 0 && index === 0 ? 'high' : undefined}
                        width="600"
                        height="600"
                      />
                    </div>
                    <h3>
                      <Translated>{member.name}</Translated>
                    </h3>
                    {member.position && (
                      <p>
                        <Translated>{member.position}</Translated>
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </section>
          );
        })}
        <section className="team-group" aria-labelledby="team-service-providers">
          <h2 id="team-service-providers">{locale === 'en' ? 'Service Providers' : '服务商'}</h2>
          <div className="team-provider-grid">
            {serviceProviders.map(({ id, zh, en, href: providerHref }) => {
              const { company, service } = locale === 'en' ? en : zh;
              const content = (
                <>
                  <h3>{company}</h3>
                  <p>{service}</p>
                </>
              );
              return providerHref ? (
                <a
                  className="team-provider-card team-provider-link"
                  key={id}
                  href={providerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <article className="team-provider-card" key={id}>
                  {content}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </SiteShell>
  );
};

export const TeamMemberPage = ({ id }: { id: string }) => {
  const { href, locale, t } = useI18n();
  const member = leadersData[id];
  if (!member) return <NotFoundPage />;
  return (
    <SiteShell activePath="/company">
      <article className="team-member-profile">
        <div className="team-member-hero">
          <div className="team-member-hero-inner">
            <a className="team-back" href={href('/company/team')}>
              {locale === 'en' ? 'Back to Team' : '返回团队页'}
            </a>
            <header className="team-member-header">
              <div className="team-portrait-stage team-portrait">
                <SiteImage
                  src={member.image}
                  alt={member.name}
                  width="600"
                  height="600"
                  sizes="(max-width: 720px) 160px, 240px"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div className="team-member-identity">
                <h1>
                  <Translated>{member.name}</Translated>
                </h1>
                {member.position && (
                  <p className="team-position">
                    <Translated>{member.position}</Translated>
                  </p>
                )}
              </div>
            </header>
          </div>
        </div>
        <div className="team-member-content">
          {member.bio && (
            <section className="team-member-resume" aria-label={locale === 'en' ? 'Biography' : '个人简历'}>
              <div className="team-biography-text">
                {member.bio.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>
                    <Translated>{paragraph}</Translated>
                  </p>
                ))}
              </div>
            </section>
          )}
          {member.sections?.map((section) => (
            <section className="team-member-resume" key={section.title} aria-label={t(section.title)}>
              <h2>
                <Translated>{section.title}</Translated>
              </h2>
              <div className="team-biography-text">
                {section.list ? (
                  <ul>
                    {section.paragraphs.map((paragraph) => (
                      <li key={paragraph}>
                        <Translated>{paragraph}</Translated>
                      </li>
                    ))}
                  </ul>
                ) : (
                  section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>
                      <Translated>{paragraph}</Translated>
                    </p>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  );
};
