import { Translated } from '../providers/i18n';
import type { ReactNode } from 'react';

/** Shared page introduction used by company pages and other page heroes. */
export const CompanyIntro = ({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
}) => (
  <header className="company-intro">
    <p className="eyebrow">
      <Translated>{eyebrow}</Translated>
    </p>
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
