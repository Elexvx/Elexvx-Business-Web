'use client';
import { Translated } from '../providers/i18n';
import { CompanyIntro } from '../components/company-intro';

import { SiteImage } from '../components/site-image';

import { leadersData, teamMembers } from '../../data/team';
import { SiteShell } from '../components/index';
import { useI18n } from '../providers/i18n';
import { NotFoundPage } from './shared';

export const TeamPage = () => {
  const { href } = useI18n();
  return (
    <SiteShell activePath="/company">
      <section className="team-page">
        <CompanyIntro eyebrow="ELEXVX TEAM" title="团队" description="研究、工程与现场经验，在同一个问题上相遇。" />
        <div className="team-grid">
          {teamMembers.map((member) => (
            <a className="team-card" data-member={member.id} href={href(`/company/team/${member.id}`)} key={member.id}>
              <div className="team-portrait-stage">
                <SiteImage
                  style={member.mirrorPortrait ? { transform: 'scaleX(-1)' } : undefined}
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  width="600"
                  height="600"
                />
              </div>
              <h2>
                <Translated>{member.name}</Translated>
              </h2>
              {member.position && (
                <p>
                  <Translated>{member.position}</Translated>
                </p>
              )}
            </a>
          ))}
        </div>
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
              ← {locale === 'en' ? 'All team members' : '全部团队成员'}
            </a>
            <header className="team-member-header">
              <div className="team-portrait-stage team-portrait">
                <SiteImage
                  style={member.mirrorPortrait ? { transform: 'scaleX(-1)' } : undefined}
                  src={member.image}
                  alt={member.name}
                  width="600"
                  height="600"
                  loading="eager"
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
