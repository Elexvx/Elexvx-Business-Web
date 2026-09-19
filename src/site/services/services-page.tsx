'use client';

import { ArrowRightOutlined, BookOutlined, CompassOutlined, LineChartOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import { Eyebrow } from '../components/ui';

type ServiceDestination = {
  href: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
};

const serviceDestinations: ServiceDestination[] = [
  {
    href: '/services/docs/',
    index: '01',
    eyebrow: 'DOCUMENTATION',
    title: '帮助文档',
    description: '了解服务入口的使用方式、信息边界与常用操作。',
    icon: <BookOutlined aria-hidden="true" />,
  },
  {
    href: '/navigation/',
    index: '02',
    eyebrow: 'BUSINESS DIRECTORY',
    title: '企业服务导航',
    description: '按工作场景查找企业系统、政务服务与公共平台入口。',
    icon: <CompassOutlined aria-hidden="true" />,
  },
  {
    href: '/status/',
    index: '03',
    eyebrow: 'SERVICE STATUS',
    title: '服务状态',
    description: '查看企业服务、项目服务与公共服务的运行状态。',
    icon: <LineChartOutlined aria-hidden="true" />,
  },
];

const ServiceDestinationCard = ({ destination }: { destination: ServiceDestination }) => (
  <a className="service-overview-card" href={destination.href}>
    <div className="service-overview-card-top">
      <span className="service-overview-card-icon">{destination.icon}</span>
      <span className="service-overview-card-index">{destination.index}</span>
    </div>
    <div className="service-overview-card-body">
      <Eyebrow>{destination.eyebrow}</Eyebrow>
      <h2>{destination.title}</h2>
      <p>{destination.description}</p>
    </div>
    <span className="service-overview-card-link">
      进入
      <ArrowRightOutlined aria-hidden="true" />
    </span>
  </a>
);

export const ServicesPage = () => (
  <>
    <section className="service-page-hero service-overview-hero">
      <div className="service-page-hero-inner">
        <Eyebrow>ELEXVX / SERVICES</Eyebrow>
        <h1>服务</h1>
        <p className="service-page-hero-description">
          帮助文档、企业服务导航与服务状态，统一从这里进入；具体业务系统仍在各自原站点运行。
        </p>
      </div>
    </section>

    <section className="service-overview" aria-label="服务入口">
      <div className="service-overview-inner">
        <header className="service-overview-heading">
          <div>
            <Eyebrow>SERVICE HUB</Eyebrow>
            <h2>从一个入口进入服务</h2>
          </div>
          <p>主站统一维护入口、导航和运行状态，让不同服务保持清楚的归属与访问路径。</p>
        </header>
        <div className="service-overview-grid">
          {serviceDestinations.map((destination) => (
            <ServiceDestinationCard destination={destination} key={destination.href} />
          ))}
        </div>
      </div>
    </section>
  </>
);

const documentationTopics = [
  {
    index: '01',
    eyebrow: 'FIND A SERVICE',
    title: '查找服务入口',
    description: '打开企业服务导航，按分类浏览，或使用搜索框查找系统名称、服务名称和关键词。',
  },
  {
    index: '02',
    eyebrow: 'OPEN THE ORIGINAL SITE',
    title: '打开原始服务',
    description: '每个入口都指向对应的原站点。点击卡片后会在新标签页打开，不改变主站当前页面。',
  },
  {
    index: '03',
    eyebrow: 'CHECK AVAILABILITY',
    title: '确认运行状态',
    description: '如果入口暂时无法访问，先查看服务状态页和历史可用性，区分服务异常与网络或权限问题。',
  },
];

export const ServiceDocsPage = () => (
  <>
    <section className="service-page-hero service-docs-hero">
      <div className="service-page-hero-inner">
        <Eyebrow>ELEXVX / DOCUMENTATION</Eyebrow>
        <h1>帮助文档</h1>
        <p className="service-page-hero-description">
          说明服务中心的入口关系、使用方式与信息边界，帮助你更快找到正确的系统。
        </p>
      </div>
    </section>

    <section className="service-docs" aria-label="帮助文档内容">
      <div className="service-docs-inner">
        <div className="service-docs-grid">
          {documentationTopics.map((topic) => (
            <article className="service-docs-card" key={topic.index}>
              <span className="service-docs-card-index">{topic.index}</span>
              <Eyebrow>{topic.eyebrow}</Eyebrow>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
            </article>
          ))}
        </div>

        <section className="service-docs-guide" aria-labelledby="service-docs-guide-title">
          <div>
            <Eyebrow>QUICK GUIDE</Eyebrow>
            <h2 id="service-docs-guide-title">使用服务中心</h2>
          </div>
          <ol>
            <li>
              <strong>先从服务页选择入口。</strong>
              <span>帮助文档解释使用方式，企业服务导航负责查找入口，服务状态负责查看运行情况。</span>
            </li>
            <li>
              <strong>再进入对应的原站点。</strong>
              <span>主站不替代各业务系统的账号、权限和业务流程；这些信息以对应原站点为准。</span>
            </li>
            <li>
              <strong>遇到异常时查看状态页。</strong>
              <span>状态页展示可观测到的运行情况和历史记录，不能替代具体系统的登录或权限支持。</span>
            </li>
          </ol>
        </section>
      </div>
    </section>
  </>
);
