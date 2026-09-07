'use client';
import { CompanyIntro } from '../components/company-intro';

import { qualifications, qualificationCategories, intellectualPropertyCategories } from '../../data/qualifications';
import { SiteShell } from '../components/index';
import { ArticleImage, ArticleGallery } from '../components/article-gallery';
import { useI18n } from '../providers/i18n';

export const QualificationsPage = () => {
  const { locale } = useI18n();
  const english = locale === 'en';
  const renderQualificationCard = (item: (typeof qualifications)[number]) => (
    <figure className="qualification-card" key={item.id}>
      <ArticleImage
        className={`qualification-image${['campus-portal', 'crane-plan'].includes(item.id) ? ' qualification-image-trimmed' : ''}`}
        src={item.image}
        alt={english ? item.englishTitle : item.title}
        watermark="embedded"
      />
      <figcaption>
        <h3>{english ? item.englishTitle : item.title}</h3>
      </figcaption>
    </figure>
  );

  return (
    <SiteShell activePath="/company">
      <ArticleGallery watermark>
        <section className="team-page qualifications-page">
          <CompanyIntro
            eyebrow="ELEXVX QUALIFICATIONS"
            title="企业资质"
            description="每一项资质与知识产权，都是可以被核验的能力记录。"
          />
          {qualificationCategories.map((category) => {
            const categoryItems = qualifications.filter((item) => item.category === category.id);
            return (
              <section className="qualification-section" key={category.id} aria-labelledby={`qualification-${category.id}`}>
                <h2 id={`qualification-${category.id}`}>{english ? category.englishTitle : category.title}</h2>
                {category.id === 'ip' ? (
                  <div className="qualification-subsections">
                    {intellectualPropertyCategories.map((subtype) => {
                      const subtypeItems = categoryItems.filter((item) => item.subtype === subtype.id);
                      if (subtypeItems.length === 0) return null;
                      const layout = subtype.id === 'copyright' ? 'qualification-grid-short' : 'qualification-grid-long';
                      return (
                        <section
                          className={`qualification-subsection qualification-subsection-${subtype.id}`}
                          key={subtype.id}
                          aria-labelledby={`qualification-${subtype.id}`}
                        >
                          <h3 id={`qualification-${subtype.id}`}>
                            {english ? subtype.englishTitle : subtype.title}
                          </h3>
                          <div className={`team-grid qualifications-grid ${layout}`}>
                            {subtypeItems.map(renderQualificationCard)}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="team-grid qualifications-grid qualification-grid-short">
                    {categoryItems.map(renderQualificationCard)}
                  </div>
                )}
              </section>
            );
          })}
        </section>
      </ArticleGallery>
    </SiteShell>
  );
};
