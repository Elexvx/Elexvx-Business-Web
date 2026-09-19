import AppstoreOutlined from '@ant-design/icons-svg/es/asn/AppstoreOutlined';
import ArrowRightOutlined from '@ant-design/icons-svg/es/asn/ArrowRightOutlined';
import AuditOutlined from '@ant-design/icons-svg/es/asn/AuditOutlined';
import BankOutlined from '@ant-design/icons-svg/es/asn/BankOutlined';
import PartitionOutlined from '@ant-design/icons-svg/es/asn/PartitionOutlined';
import RobotOutlined from '@ant-design/icons-svg/es/asn/RobotOutlined';
import SafetyCertificateOutlined from '@ant-design/icons-svg/es/asn/SafetyCertificateOutlined';
import TeamOutlined from '@ant-design/icons-svg/es/asn/TeamOutlined';
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/es/types';
import { createElement, type ReactElement } from 'react';

import {
  serviceNavigation,
  serviceNavigationConfig,
  type ServiceCategory,
  type ServiceLink,
} from '../../data/service-navigation';
import { NavigationSearch } from './navigation-search';

const CATEGORY_ICONS = {
  企业系统: AppstoreOutlined,
  政务链接: BankOutlined,
  知识产权: SafetyCertificateOutlined,
  企业信用: AuditOutlined,
  人工智能: RobotOutlined,
  公众平台: TeamOutlined,
};

function renderIconNode(node: AbstractNode, key: string): ReactElement {
  return createElement(
    node.tag,
    { ...node.attrs, key },
    node.children?.map((child, index) => renderIconNode(child, `${key}-${index}`))
  );
}

function ServiceIcon({ definition, className }: { definition: IconDefinition; className?: string }) {
  const root =
    typeof definition.icon === 'function' ? definition.icon('currentColor', 'currentColor') : definition.icon;

  return createElement(
    root.tag,
    {
      ...root.attrs,
      className,
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      'aria-hidden': true,
    },
    root.children?.map((child, index) => renderIconNode(child, String(index)))
  );
}

function LinkIcon({ link }: { link: ServiceLink }) {
  if (!link.icon) {
    return (
      <span className="service-link-icon-fallback" role="img" aria-label={`${link.name}图标`}>
        <ServiceIcon definition={PartitionOutlined} />
      </span>
    );
  }

  return (
    <img
      className="service-link-icon"
      src={link.icon}
      alt={`${link.name}图标`}
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
    />
  );
}

function DirectoryRow({ link }: { link: ServiceLink }) {
  return (
    <a
      className="service-directory-row"
      data-link-id={link.id}
      data-search-tags={link.tags.join(' ')}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="service-link-icon-frame">
        <LinkIcon link={link} />
      </span>
      <span className="service-link-body">
        <span className="service-link-title">{link.name}</span>
        <span className="service-link-description">{link.description || '打开链接'}</span>
      </span>
      <ServiceIcon definition={ArrowRightOutlined} className="service-row-arrow" />
    </a>
  );
}

function DirectoryGrid({ links }: { links: ServiceLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="service-directory-panel">
      <div className="service-directory-grid">
        {links.map((link) => (
          <DirectoryRow key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}

function NavigationSection({ category }: { category: ServiceCategory }) {
  return (
    <section className="service-category" id={`category-${category.id}`} aria-labelledby={`heading-${category.id}`}>
      <div className="service-category-heading">
        <div className="service-category-title">
          <span className="service-category-icon" aria-hidden="true">
            <ServiceIcon
              definition={CATEGORY_ICONS[category.category as keyof typeof CATEGORY_ICONS] ?? AppstoreOutlined}
            />
          </span>
          <h2 id={`heading-${category.id}`}>{category.category}</h2>
        </div>
      </div>
      <DirectoryGrid links={category.links} />
      {category.subcategories.map((subcategory) => (
        <div className="service-subcategory" id={`subcategory-${subcategory.id}`} key={subcategory.id}>
          <h3>{subcategory.name}</h3>
          <DirectoryGrid links={subcategory.links} />
        </div>
      ))}
    </section>
  );
}

export const NavigationPage = () => {
  return (
    <>
      <section className="service-page-hero service-navigation-hero">
        <div className="service-page-hero-inner">
          <p className="eyebrow">ELEXVX / BUSINESS DIRECTORY</p>
          <h1>企业服务导航</h1>
          <p className="service-page-hero-description">{serviceNavigationConfig.site.description}</p>
          <NavigationSearch searchConfig={serviceNavigationConfig.search} />
        </div>
      </section>

      <section className="service-directory" aria-label="企业服务导航分类">
        <div className="service-directory-inner">
          <div className="service-category-list">
            {serviceNavigation.map((category) => (
              <NavigationSection category={category} key={category.id} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
