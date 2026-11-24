import type { ReactNode } from 'react';
import { Translated } from '../providers/i18n';
import { classNames } from './ui';

/** Shared page introduction used by company pages and other page heroes. */
export const CompanyIntro = ({
  eyebrow,
  title,
  description,
  centered = false,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  centered?: boolean;
  children?: ReactNode;
}) => (
  <header className={classNames('company-intro', centered && 'company-intro-centered')}>
    {eyebrow && (
      <p className="eyebrow">
        <Translated>{eyebrow}</Translated>
      </p>
    )}
    <h1>
      <Translated>{title}</Translated>
    </h1>
    <p className="company-intro-description">
      <Translated>{description}</Translated>
    </p>
    {children && (
      <div className="company-intro-actions">
        <Translated>{children}</Translated>
      </div>
    )}
  </header>
);
