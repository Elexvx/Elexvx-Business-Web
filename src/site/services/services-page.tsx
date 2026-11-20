'use client';

import { BookOutlined, CompassOutlined, LineChartOutlined } from '@ant-design/icons';
import { useState, type ReactNode } from 'react';

import { IndexHeading } from '../components/index-heading';
import { documentationUrl } from '../../data/service-routes';

type ServiceDestination = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

const serviceDestinations: ServiceDestination[] = [
  {
    href: documentationUrl,
    title: '帮助文档',
    description: '前往 Elexvx 文档中心，查看使用指南与帮助内容。',
    icon: <BookOutlined aria-hidden="true" />,
  },
  {
    href: '/navigation/',
    title: '企业服务导航',
    description: '按工作场景查找企业系统、政务服务与公共平台入口。',
    icon: <CompassOutlined aria-hidden="true" />,
  },
  {
    href: '/status/',
    title: '服务状态',
    description: '查看企业服务、项目服务与公共服务的运行状态。',
    icon: <LineChartOutlined aria-hidden="true" />,
  },
];

const ServiceDestinationCard = ({ destination }: { destination: ServiceDestination }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <a
      className="service-overview-card"
      href={destination.href}
      data-preview={showPreview ? '' : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setShowPreview(true);
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) setShowPreview(true);
      }}
    >
      <span className="service-overview-card-icon">{destination.icon}</span>
      <div className="service-overview-card-body">
        <h2>{destination.title}</h2>
        <p>{destination.description}</p>
      </div>
      <span className="service-overview-card-link">进入</span>
    </a>
  );
};

export const ServicesPage = () => (
  <section className="service-overview" aria-labelledby="services-index-title">
    <div className="service-overview-inner">
      <IndexHeading id="services-index-title" title="服务" />
      <div className="service-overview-grid">
        {serviceDestinations.map((destination) => (
          <ServiceDestinationCard destination={destination} key={destination.href} />
        ))}
      </div>
    </div>
  </section>
);
