'use client';

import PartitionOutlined from '@ant-design/icons-svg/es/asn/PartitionOutlined';
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/es/types';
import { createElement, type ReactElement } from 'react';

import {
  serviceNavigation,
  serviceNavigationConfig,
  type ServiceCategory,
  type ServiceLink,
} from '../../data/service-navigation';
import { IndexHeading } from '../components/index-heading';
import { useI18n } from '../providers/i18n';
import { DirectorySearch } from './navigation-search';
import { canonicalContentHref } from '../routing/content-href';

function normalizeSvgAttributes(attrs: AbstractNode['attrs']) {
  return Object.fromEntries(
    Object.entries(attrs).map(([name, value]) => [
      name === 'class' ? 'className' : name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value,
    ])
  );
}

function renderIconNode(node: AbstractNode, key: string): ReactElement {
  return createElement(
    node.tag,
    { ...normalizeSvgAttributes(node.attrs), key },
    node.children?.map((child, index) => renderIconNode(child, `${key}-${index}`))
  );
}

function ServiceIcon({ definition }: { definition: IconDefinition }) {
  const root =
    typeof definition.icon === 'function' ? definition.icon('currentColor', 'currentColor') : definition.icon;

  return createElement(
    root.tag,
    {
      ...normalizeSvgAttributes(root.attrs),
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      'aria-hidden': true,
    },
    root.children?.map((child, index) => renderIconNode(child, String(index)))
  );
}

function LinkIcon({ link, eager = false, t }: { link: ServiceLink; eager?: boolean; t: (text: string) => string }) {
  if (!link.icon) {
    return (
      <span className="service-link-icon-fallback" aria-hidden="true">
        <ServiceIcon definition={PartitionOutlined} />
      </span>
    );
  }

  return (
    <img
      className="service-link-icon"
      src={link.icon}
      alt={t(link.name)}
      width={44}
      height={44}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

function DirectoryRow({ link, eager = false, t }: { link: ServiceLink; eager?: boolean; t: (text: string) => string }) {
  const title = t(link.name);
  const description = t(link.description.trim());
  return (
    <a
      className="service-directory-row"
      data-link-id={link.id}
      data-search-tags={link.tags.map(t).join(' ')}
      href={canonicalContentHref(link.url)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="service-link-icon-frame">
        <LinkIcon link={link} eager={eager} t={t} />
      </span>
      <span className="service-link-body">
        <span className="service-link-title" title={title}>
          {title}
        </span>
        {description && description !== title && (
          <span className="service-link-description" title={description}>
            {description}
          </span>
        )}
      </span>
    </a>
  );
}

function DirectoryGrid({
  links,
  eager = false,
  t,
}: {
  links: ServiceLink[];
  eager?: boolean;
  t: (text: string) => string;
}) {
  if (links.length === 0) return null;
  return (
    <div className="service-directory-grid">
      {links.map((link) => (
        <DirectoryRow key={link.id} link={link} eager={eager} t={t} />
      ))}
    </div>
  );
}

function NavigationSection({
  category,
  eager = false,
  t,
}: {
  category: ServiceCategory;
  eager?: boolean;
  t: (text: string) => string;
}) {
  return (
    <section className="service-category" id={`category-${category.id}`} aria-labelledby={`heading-${category.id}`}>
      <h2 className="service-category-heading" id={`heading-${category.id}`}>
        {t(category.category)}
      </h2>
      <DirectoryGrid links={category.links} eager={eager} t={t} />
      {category.subcategories.map((subcategory) => (
        <div className="service-subcategory" id={`subcategory-${subcategory.id}`} key={subcategory.id}>
          <h3>{t(subcategory.name)}</h3>
          <DirectoryGrid links={subcategory.links} eager={eager} t={t} />
        </div>
      ))}
    </section>
  );
}

export const NavigationPage = () => {
  const { t } = useI18n();
  return (
    <>
      <section className="service-page-hero service-navigation-hero" aria-labelledby="service-navigation-title">
        <div className="service-page-hero-inner">
          <div className="service-page-hero-copy">
            <IndexHeading id="service-navigation-title" title={t('企业服务导航')} />
          </div>
          <DirectorySearch searchConfig={serviceNavigationConfig.search} />
        </div>
      </section>

      <section className="service-directory" aria-label={t('企业服务导航分类')}>
        <div className="service-directory-inner">
          {serviceNavigation.map((category, index) => (
            <NavigationSection category={category} eager={index < 2} key={category.id} t={t} />
          ))}
        </div>
      </section>
    </>
  );
};
