'use client';

import { humiteContent } from '#humite-content';
import { homeContent } from '../../data/page-content';
import { ArticleCard } from '../components/article-card';
import { HomeHero, HomeLaunchProvider } from '../components/home-hero';
import { SiteShell } from '../components/index';
import { SiteImage } from '../components/site-image';
import { Translated, useI18n } from '../providers/i18n';
import { ProductShowcase } from './product-showcase';
import { NotFoundPage } from './shared';

export const ProductCatalogPage = () => {
  const { t } = useI18n();
  const products = homeContent.product.items;
  return (
    <SiteShell activePath="/products">
      <HomeLaunchProvider initialReleased={!!humiteContent}>
        <HomeHero showAnnouncement={false} fallbackTitle="产品" />
      </HomeLaunchProvider>
      {products.length > 0 && (
        <section className="product-index" aria-labelledby="product-index-title">
          <h2 className="index-heading" id="product-index-title">
            {t('产品')}
          </h2>
          <div className="home-media-grid home-products-grid media-card-list">
            {products.map((product) => (
              <ArticleCard
                key={product.slug}
                cover={product.image}
                title={product.name}
                category="已发布"
                href={product.href}
              />
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
};

export const ProductDetailPage = ({ slug }: { slug: string }) => {
  const { href, t } = useI18n();
  const product = homeContent.product.items.find((item) => item.slug === slug);
  if (!product) return <NotFoundPage />;
  if (slug === 'humite' && humiteContent)
    return <ProductShowcase content={humiteContent.showcase} image={product.image} />;
  return (
    <SiteShell activePath="/products">
      <article className="team-profile">
        <a className="team-back" href={href('/products')}>
          <Translated>{'全部产品'}</Translated>
        </a>
        <div className="team-profile-layout">
          <SiteImage className="team-portrait" src={product.image} alt={product.name} width={1600} height={1600} />
          <div className="team-biography">
            <header>
              <p className="eyebrow">{t(product.category)}</p>
              <h1>
                <Translated>{product.name}</Translated>
              </h1>
            </header>
            <div className="team-biography-text">
              <p>{t(product.description)}</p>
            </div>
          </div>
        </div>
      </article>
    </SiteShell>
  );
};
