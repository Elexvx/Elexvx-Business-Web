'use client';
import { SiteSelect } from '../components/primitives/select';
import { useState } from 'react';
import { jobs, jobsData } from '../../data/jobs';
import { careersContent } from '../../data/careers';
import { SiteShell, ActionButton } from '../components/index';
import { useI18n } from '../providers/i18n';
import { NotFoundPage } from './shared';

export const CareersPage = () => {
  const { href } = useI18n();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const visible = jobs.filter(
    (job) =>
      (!type || job.type === type) &&
      (!location || job.location === location) &&
      `${job.title} ${job.description} ${job.location}`.toLowerCase().includes(query.trim().toLowerCase())
  );
  return (
    <SiteShell activePath="/careers">
      <div className="careers-page">
        <header className="careers-hero">
          <p>工作机会</p>
          <h1>
            加入宏翔商道
            <br />
            一起用 AI 技术改变世界
          </h1>
          <p className="careers-lead">{careersContent.intro}</p>
          <ActionButton href="#open-roles">查看热招职位</ActionButton>
        </header>
        <section className="careers-culture" aria-labelledby="culture-title">
          <h2 id="culture-title">
            在宏翔商道，你不仅获得一份工作，
            <br />
            而是与志同道合者共创价值的旅程。
          </h2>
          <div className="careers-editorial">
            <h3>为什么选择我们</h3>
            <div>
              {careersContent.culture.map((item) => (
                <div className="careers-value" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="careers-editorial">
            <h3>我们禁止以下行为</h3>
            <div>
              <p className="careers-section-intro">请遵守以下准则，共塑健康、诚信的职场环境</p>
              {careersContent.conduct.map((item) => (
                <div className="careers-value" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="careers-roles" id="open-roles" aria-labelledby="roles-title">
          <h2 id="roles-title">热招职位</h2>
          <p>我们正在寻找志同道合的伙伴，一起创造AI驱动的未来。</p>
          <div className="careers-filters">
            <label>
              搜索职位
              <input
                type="search"
                placeholder="职位名称或关键词"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              工作地点
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
              职位类型
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
            {visible.length} 个职位
          </p>
          <div className="careers-job-list">
            {visible.map((job) => (
              <a className="careers-job-row" key={job.id} href={href(`/careers/${job.id}`)}>
                <h3>{job.title}</h3>
                <span>
                  {job.location}
                  <small>
                    {job.type} · {job.experience}
                  </small>
                </span>
                <span>{job.salary}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          {!visible.length && <p className="careers-empty">暂无匹配职位，请尝试其他关键词或筛选条件。</p>}
        </section>
        <section className="careers-closing">
          <h2>与我们一起，创造未来</h2>
          <p>{careersContent.values}</p>
          <ActionButton href="#open-roles">查看所有职位</ActionButton>
        </section>
      </div>
    </SiteShell>
  );
};

export const JobPage = ({ id }: { id: string }) => {
  const { href } = useI18n();
  const job = jobsData[id];
  if (!job) return <NotFoundPage />;
  return (
    <SiteShell activePath="/careers">
      <article className="job-detail">
        <a className="team-back" href={href('/careers#open-roles')}>
          ← 全部职位
        </a>
        <header>
          <p>工作机会</p>
          <h1>{job.title}</h1>
          <p className="job-meta">{[job.location, job.type, job.experience, job.salary].filter(Boolean).join(' · ')}</p>
        </header>
        <div className="job-detail-layout">
          <div>
            <section>
              <h2>职位介绍</h2>
              <p>{job.description}</p>
            </section>
            {[
              ['工作职责', job.responsibilities],
              ['任职要求', job.requirements],
              ['福利待遇', job.benefits],
            ].map(([title, items]) =>
              Array.isArray(items) && items.length > 0 ? (
                <section key={title as string}>
                  <h2>{title}</h2>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null
            )}
          </div>
          <aside>
            {job.applyUrl && <ActionButton href={job.applyUrl}>申请职位 ↗</ActionButton>}
            <p>通过招聘表单提交申请。</p>
          </aside>
        </div>
      </article>
    </SiteShell>
  );
};
