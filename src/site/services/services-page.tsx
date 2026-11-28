'use client';

import { BookOutlined, CompassOutlined, LineChartOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import { IndexHeading } from '../components/index-heading';
import { useI18n } from '../providers/i18n';
import { documentationUrl } from '../../data/service-routes';

type ServiceDestination = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  imageWidth: number;
  imageHeight: number;
};

const serviceDestinations: ServiceDestination[] = [
  {
    href: documentationUrl,
    title: '帮助文档',
    description: '前往 Elexvx 文档中心，查看使用指南与帮助内容。',
    icon: <BookOutlined aria-hidden="true" />,
    image: '/visuals/services/documentation.webp',
    imageWidth: 450,
    imageHeight: 450,
  },
  {
    href: '/navigation/',
    title: '企业服务导航',
    description: '按工作场景查找企业系统、政务服务与公共平台入口。',
    icon: <CompassOutlined aria-hidden="true" />,
    image: '/visuals/services/navigation.webp',
    imageWidth: 960,
    imageHeight: 540,
  },
  {
    href: '/status/',
    title: '服务状态',
    description: '查看企业服务、项目服务与公共服务的运行状态。',
    icon: <LineChartOutlined aria-hidden="true" />,
    image: '/visuals/services/navigation.webp',
    imageWidth: 960,
    imageHeight: 540,
  },
];

const ServiceDestinationCard = ({ destination }: { destination: ServiceDestination }) => {
  const { t, href } = useI18n();
  return (
    <a className="service-overview-card" href={href(destination.href)}>
      <img
        className="service-overview-card-bg"
        src={destination.image}
        alt={t(destination.title)}
        width={destination.imageWidth}
        height={destination.imageHeight}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <span className="service-overview-card-icon">{destination.icon}</span>
      <div className="service-overview-card-body">
        <h2>{t(destination.title)}</h2>
        <p>{t(destination.description)}</p>
      </div>
      <span className="service-overview-card-link">{t('进入')}</span>
    </a>
  );
};

export const ServicesPage = () => {
  const { t } = useI18n();
  return (
    <section className="service-overview" aria-labelledby="services-index-title">
      <div className="service-overview-inner">
        <IndexHeading id="services-index-title" title={t('服务')} />
        <div className="service-overview-grid">
          {serviceDestinations.map((destination) => (
            <ServiceDestinationCard destination={destination} key={destination.href} />
          ))}
        </div>
      </div>
    </section>
  );
};
