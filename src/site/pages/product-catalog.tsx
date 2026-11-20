'use client';

import { humiteContent } from '#humite-content';
import { homeContent } from '../../data/page-content';
import { ArticleCard } from '../components/article-card';
import { SiteShell } from '../components/index';
import { IndexHeading } from '../components/index-heading';
import { SiteImage } from '../components/site-image';
import { useCategoryFilter } from '../providers/category-filter';
import { Translated, useI18n } from '../providers/i18n';
import { ProductShowcase } from './product-showcase';
import { NotFoundPage } from './shared';

export const ProductCatalogPage = () => {
  const [category, selectCategory] = useCategoryFilter();
  const { locale, t } = useI18n();
  const products = homeContent.product.items;
  const categories = [...new Set(products.map((product) => product.category))];
  const activeCategory = categories.find((value) => value === category);
  const visible = products.filter((product) => category === 'all' || product.category === category);
  return (
    <SiteShell activePath="/products">
      <section className="product-index" aria-labelledby="product-index-title">
        <IndexHeading id="product-index-title" title={t('产品')} category={activeCategory && t(activeCategory)} />
        <nav
          className="research-index-tabs index-category-tabs"
          aria-label={locale === 'en' ? 'Product categories' : '产品分类'}
        >
          {['all', ...categories].map((value) => (
            <button
              key={value}
              type="button"
              className={`research-index-tab ${category === value ? 'research-index-tab-active' : ''}`}
              aria-pressed={category === value}
              onClick={() => selectCategory(value)}
            >
              {value === 'all' ? t('全部') : t(value)}
            </button>
          ))}
        </nav>
        <div className="home-media-grid home-products-grid">
          {visible.map((product) => (
            <ArticleCard
              key={product.slug}
              cover={product.image}
              title={product.name}
              category={product.category}
              href={product.href}
            />
          ))}
        </div>
        {!visible.length && (
          <p>
            {t(products.length ? '暂无匹配内容' : '当前没有公开展示的产品。新品发布后会在这里更新，欢迎届时回来看看。')}
          </p>
        )}
      </section>
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
