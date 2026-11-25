'use client';

import { SiteImage } from './site-image';

import { isDisabledPath } from '../../data/disabled-sections';

import { type ReactNode } from 'react';

import { LocalizedTitle as Title, useI18n } from '../providers/i18n';

type TileTone = 'light' | 'dark' | 'parchment';

export const classNames = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const Logo = ({ inverse = false, eager = false }: { inverse?: boolean; eager?: boolean }) => (
  <SiteImage
    loading={eager ? 'eager' : 'lazy'}
    className={classNames('site-logo', inverse && 'site-logo-inverse')}
    src="/brand/elexvx-logo-black-240.webp"
    alt="Elexvx"
    width="240"
    height="52"
  />
);

export const ActionButton = ({
  href,
  children,
  secondary = false,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  dark?: boolean;
}) => {
  const { t, href: localizedHref } = useI18n();
  if (isDisabledPath(href)) return null;
  return (
    <a
      href={localizedHref(href)}
      className={classNames('action-button', secondary && 'action-button-secondary', dark && 'action-button-on-dark')}
    >
      {typeof children === 'string' ? t(children) : children}
    </a>
  );
};

export const TextLink = ({
  href,
  children,
  onDark = false,
}: {
  href: string;
  children: ReactNode;
  onDark?: boolean;
}) => {
  const { t, href: localizedHref } = useI18n();
  if (isDisabledPath(href)) return null;
  return (
    <a className={classNames('text-link', onDark && 'text-link-on-dark')} href={localizedHref(href)}>
      {typeof children === 'string' ? t(children) : children}
    </a>
  );
};

export const Eyebrow = ({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) => {
  const { t } = useI18n();
  return (
    <p className={classNames('eyebrow', onDark && 'eyebrow-on-dark')}>
      {typeof children === 'string' ? t(children) : children}
    </p>
  );
};

export const TechnicalFigure = ({
  variant = 'network',
  label,
}: {
  variant?: 'network' | 'signal' | 'boundary';
  label?: string;
}) => {
  const { t } = useI18n();
  const figureContent = {
    network: {
      eyebrow: '研究图谱',
      title: '研究系统 / 真实问题',
      description: '这里将替换为研究方向、问题与方法之间的真实关系图。',
      asset: '研究方向关系图',
    },
    signal: {
      eyebrow: '项目证据',
      title: '项目系统 / 证据边界',
      description: '这里将替换为真实项目现场、系统截图或技术架构图。',
      asset: '项目现场或系统架构图',
    },
    boundary: {
      eyebrow: '方法图谱',
      title: '方向 → 方法 → 输出',
      description: '这里将替换为已核验的研究流程或成果素材。',
      asset: '研究流程 / 输出关系图',
    },
  }[variant];

  return (
    <figure className={classNames('technical-figure', `technical-figure-${variant}`)}>
      <div className="technical-figure-head">
        <div>
          <p className="technical-figure-eyebrow">{t(figureContent.eyebrow)}</p>
          <figcaption>{t(label ?? figureContent.title)}</figcaption>
        </div>
        <span className="technical-figure-status">{t('真实素材 / 待补充')}</span>
      </div>
      <div className="technical-figure-body">
        <div className="technical-figure-state">
          <span className="technical-figure-state-label">{t('内容状态')}</span>
          <strong>{t('结构已保留')}</strong>
          <p>{t(figureContent.description)}</p>
        </div>
        <dl className="technical-figure-facts">
          <div>
            <dt>{t('当前展示')}</dt>
            <dd>{t(figureContent.asset)}</dd>
          </div>
          <div>
            <dt>{t('公开状态')}</dt>
            <dd>{t('素材确认后替换')}</dd>
          </div>
        </dl>
      </div>
    </figure>
  );
};

export const EvidenceList = ({
  items,
  onDark = false,
}: {
  items: Array<{ label: string; value: string }>;
  onDark?: boolean;
}) => {
  const { t } = useI18n();
  return (
    <dl className={classNames('evidence-list', onDark && 'evidence-list-on-dark')}>
      {items.map((item) => (
        <div className="evidence-row" key={item.label}>
          <dt>{t(item.label)}</dt>
          <dd>{t(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
};

export const ResearchTile = ({
  tone,
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
}: {
  tone: TileTone;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => {
  const { t } = useI18n();
  return (
    <section className={classNames('research-tile', `research-tile-${tone}`, className)}>
      <div className="tile-inner">
        <div className="tile-copy">
          {eyebrow && <Eyebrow onDark={tone === 'dark'}>{eyebrow}</Eyebrow>}
          <h2>
            <Title text={title} />
          </h2>
          {description && <p className="tile-description">{t(description)}</p>}
          {actions && <div className="tile-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
};
