'use client';

import { useState } from 'react';
import { qualifications, qualificationCategories, intellectualPropertyCategories } from '../../data/qualifications';
import { SiteShell } from '../components/index';
import { SiteImage } from '../components/site-image';
import { useI18n } from '../providers/i18n';

export const QualificationsPage = () => {
  const { locale } = useI18n();
  const english = locale === 'en';
  const [category, setCategory] = useState('all');
  const [subtype, setSubtype] = useState('all');
  const visible = qualifications.filter(
    (item) =>
      (category === 'all' || item.category === category) &&
      (category !== 'ip' || subtype === 'all' || item.subtype === subtype)
  );
  return (
    <SiteShell activePath="/company">
      <section className="team-page qualifications-page">
        <header className="team-heading">
          <p className="eyebrow">ELEXVX QUALIFICATIONS</p>
          <h1>{english ? 'Company qualifications' : '企业资质'}</h1>
        </header>
        <nav className="research-index-tabs" aria-label={english ? 'Qualification categories' : '资质分类'}>
          {[{ id: 'all', title: '全部', englishTitle: 'All' }, ...qualificationCategories].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`research-index-tab ${category === item.id ? 'research-index-tab-active' : ''}`}
              aria-pressed={category === item.id}
              onClick={() => {
                setCategory(item.id);
                setSubtype('all');
              }}
            >
              {english ? item.englishTitle : item.title}
            </button>
          ))}
        </nav>
        {category === 'ip' && (
          <nav
            className="research-index-tabs qualification-subcategories"
            aria-label={english ? 'Intellectual property categories' : '知识产权分类'}
          >
            {[{ id: 'all', title: '全部', englishTitle: 'All' }, ...intellectualPropertyCategories].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`research-index-tab ${subtype === item.id ? 'research-index-tab-active' : ''}`}
                aria-pressed={subtype === item.id}
                onClick={() => setSubtype(item.id)}
              >
                {english ? item.englishTitle : item.title}
              </button>
            ))}
          </nav>
        )}
        <div className="team-grid qualifications-grid">
          {visible.map((item) => (
            <figure className="qualification-card" key={item.id}>
              <a
                className="qualification-image"
                href={item.image}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${english ? 'View original: ' : '查看原图：'}${english ? item.englishTitle : item.title}`}
              >
                <SiteImage src={item.image} alt={english ? item.englishTitle : item.title} width="900" height="675" />
              </a>
              <figcaption>
                <h2>{english ? item.englishTitle : item.title}</h2>
                {item.registration && <p>{english ? 'Registration: ' : '登记号：'}{item.registration}</p>}
                {item.registeredAt && <p>{english ? 'Registered: ' : '登记日期：'}{item.registeredAt}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
        {visible.length === 0 && (
          <p className="qualification-empty" role="status">
            {english ? 'No materials available in this category yet.' : '该分类暂无展示材料'}
          </p>
        )}
      </section>
    </SiteShell>
  );
};
