'use client';

import { CompanyIntro } from '../components/company-intro';
import { SiteShell } from '../components/index';
import { Translated } from '../providers/i18n';
import { DesignLayoutSection, DesignReferenceSection, DesignSpecimenSection } from './design-sections';

export const DesignPage = () => (
  <SiteShell activePath="/company/design">
    <article className="design-guide">
      <CompanyIntro centered title="官网设计规范" description="从信息层级到页面边界，让复杂内容保持清楚、安静、可读。">
        <a className="design-download" href="/company/design/design.md" download="design.md">
          <Translated>{'下载 design.md ↓'}</Translated>
        </a>
      </CompanyIntro>

      <DesignSpecimenSection />
      <DesignLayoutSection />
      <DesignReferenceSection />
    </article>
  </SiteShell>
);
