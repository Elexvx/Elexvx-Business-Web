'use client';
import { Translated } from '../providers/i18n';
import { CompanyIntro } from '../components/company-intro';
import { SiteSelect } from '../components/primitives/select';
import { useState } from 'react';
import { jobs, jobsData } from '../../data/jobs';
import { careersContent } from '../../data/careers';
import { SiteShell, ActionButton } from '../components/index';
import { useI18n } from '../providers/i18n';
import { NotFoundPage } from './shared';

export const CareersPage = () => {
  const { href, t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const visible = jobs.filter(
    (job) =>
      (!type || job.type === type) &&
      (!location || job.location === location) &&
      `${t(job.title)} ${t(job.description || '')} ${t(job.location || '')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  );
  return (
    <SiteShell activePath="/careers">
      <div className="careers-page">
        <CompanyIntro eyebrow="ELEXVX CAREERS" title="加入宏翔商道" description={careersContent.intro}>
          <ActionButton href="#open-roles">查看热招职位</ActionButton>
        </CompanyIntro>
        <section className="careers-culture" aria-labelledby="culture-title">
          <h2 id="culture-title">
            <Translated>{'在宏翔商道，你不仅获得一份工作，'}</Translated>
            <br />
            <Translated>{'而是与志同道合者共创价值的旅程。'}</Translated>
          </h2>
          <div className="careers-editorial">
            <h3>
              <Translated>{'为什么选择我们'}</Translated>
            </h3>
            <div>
              {careersContent.culture.map((item) => (
                <div className="careers-value" key={item.title}>
                  <h4>
                    <Translated>{item.title}</Translated>
                  </h4>
                  <p>
                    <Translated>{item.description}</Translated>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="careers-editorial">
            <h3>
              <Translated>{'我们禁止以下行为'}</Translated>
            </h3>
            <div>
              <p className="careers-section-intro">
                <Translated>{'请遵守以下准则，共塑健康、诚信的职场环境'}</Translated>
              </p>
              {careersContent.conduct.map((item) => (
                <div className="careers-value" key={item.title}>
                  <h4>
                    <Translated>{item.title}</Translated>
                  </h4>
                  <p>
                    <Translated>{item.description}</Translated>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="careers-roles" id="open-roles" aria-labelledby="roles-title">
          <h2 id="roles-title">
            <Translated>{'热招职位'}</Translated>
          </h2>
          <p>
            <Translated>{'我们正在寻找志同道合的伙伴，一起创造AI驱动的未来。'}</Translated>
          </p>
          <div className="careers-filters">
            <label>
              <Translated>{'搜索职位'}</Translated>
              <input
                type="search"
                placeholder={t('职位名称或关键词')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              <Translated>{'工作地点'}</Translated>
              <SiteSelect
                label="工作地点"
                value={location}
                onValueChange={setLocation}
                allLabel="全部地点"
                options={[
                  ...new Set(jobs.map((job) => job.location).filter((value): value is string => Boolean(value))),
                ]}
              />
            </label>
            <label>
              <Translated>{'职位类型'}</Translated>
              <SiteSelect
                label="职位类型"
                value={type}
                onValueChange={setType}
                allLabel="全部类型"
                options={[...new Set(jobs.map((job) => job.type).filter((value): value is string => Boolean(value)))]}
              />
            </label>
          </div>
          <p className="careers-count" role="status">
            {locale === 'en'
              ? `${visible.length} ${visible.length === 1 ? 'position' : 'positions'}`
              : `${visible.length}个职位`}
          </p>
          <div className="careers-job-list">
            {visible.map((job) => (
              <a className="careers-job-row" key={job.id} href={href(`/careers/${job.id}`)}>
                <h3>
                  <Translated>{job.title}</Translated>
                </h3>
                <span>
                  <Translated>{job.location}</Translated>
                  <small>
                    <Translated>{job.type}</Translated> · <Translated>{job.experience}</Translated>
                  </small>
                </span>
                <span>
                  <Translated>{job.salary}</Translated>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          {!visible.length && (
            <p className="careers-empty">
              <Translated>{'暂无匹配职位，请尝试其他关键词或筛选条件。'}</Translated>
            </p>
          )}
        </section>
        <section className="careers-closing">
          <h2>
            <Translated>{'与我们一起，创造未来'}</Translated>
          </h2>
          <p>
            <Translated>{careersContent.values}</Translated>
          </p>
          <ActionButton href="#open-roles">查看所有职位</ActionButton>
        </section>
      </div>
    </SiteShell>
  );
};

export const JobPage = ({ id }: { id: string }) => {
  const { href, t } = useI18n();
  const job = jobsData[id];
  if (!job) return <NotFoundPage />;
  return (
    <SiteShell activePath="/careers">
      <article className="job-detail">
        <a className="team-back" href={href('/careers#open-roles')}>
          <Translated>{'← 全部职位'}</Translated>
        </a>
        <header>
          <p>
            <Translated>{'工作机会'}</Translated>
          </p>
          <h1>
            <Translated>{job.title}</Translated>
          </h1>
          <p className="job-meta">
            {[job.location, job.type, job.experience, job.salary]
              .filter(Boolean)
              .map((value) => t(value || ''))
              .join(' · ')}
          </p>
        </header>
        <div className="job-detail-layout">
          <div>
            <section>
              <h2>
                <Translated>{'职位介绍'}</Translated>
              </h2>
              <p>
                <Translated>{job.description}</Translated>
              </p>
            </section>
            {[
              ['工作职责', job.responsibilities],
              ['任职要求', job.requirements],
              ['福利待遇', job.benefits],
            ].map(([title, items]) =>
              Array.isArray(items) && items.length > 0 ? (
                <section key={title as string}>
                  <h2>
                    <Translated>{title}</Translated>
                  </h2>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>
                        <Translated>{item}</Translated>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null
            )}
          </div>
          <aside>
            {job.applyUrl && <ActionButton href={job.applyUrl}>申请职位 ↗</ActionButton>}
            <p>
              <Translated>{'通过招聘表单提交申请。'}</Translated>
            </p>
          </aside>
        </div>
      </article>
    </SiteShell>
  );
};
