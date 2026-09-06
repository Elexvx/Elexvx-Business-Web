'use client';

import { SiteImage } from '../components/site-image';

import { leadersData, teamMembers } from '../../data/team';
import { SiteShell } from '../components/index';
import { useI18n } from '../providers/i18n';
import { NotFoundPage } from './shared';

export const TeamPage = () => {
  const { href, locale } = useI18n();
  return (
    <SiteShell activePath="/company">
      <section className="team-page">
        <header className="team-heading">
          <p className="eyebrow">ELEXVX TEAM</p>
          <h1>{locale === 'en' ? 'Our team' : '团队'}</h1>
        </header>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <a className="team-card" href={href(`/company/team/${member.id}`)} key={member.id}>
              <SiteImage src={member.image} alt={member.name} loading="lazy" width="600" height="600" />
              <h2>{member.name}</h2>
              <p>{member.position}</p>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
};

export const TeamMemberPage = ({ id }: { id: string }) => {
  const { href, locale } = useI18n();
  const member = leadersData[id];
  if (!member) return <NotFoundPage />;
  return (
    <SiteShell activePath="/company">
      <article className="team-profile team-member-profile">
        <a className="team-back" href={href('/company/team')}>
          ← {locale === 'en' ? 'All team members' : '全部团队成员'}
        </a>
        <header className="team-member-header">
          <SiteImage className="team-portrait" src={member.image} alt={member.name} width="600" height="600" loading="eager" />
          <div>
            <h1>{member.name}</h1>
            <p className="team-position">{member.position}</p>
          </div>
        </header>
        <section className="team-member-resume" aria-label={locale === 'en' ? 'Biography' : '个人简历'}>
          <h2>{locale === 'en' ? 'Biography' : '个人简历'}</h2>
          <div className="team-biography-text">
            {member.bio.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      </article>
    </SiteShell>
  );
};
