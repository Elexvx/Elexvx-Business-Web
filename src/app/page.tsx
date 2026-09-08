import { LanguageProvider } from '../site/providers/i18n';
import { SiteShell } from '../site/components/shell';
import { metadataForRoute } from '../site/routing/metadata-base';
import { siteIdentity } from '../data/site';
import homeHtml from '../data/home-static.json';

export const metadata = metadataForRoute(
  { title: siteIdentity.researchName, description: siteIdentity.description },
  '/'
);

export default function Page() {
  return (
    <LanguageProvider locale="zh-CN" path="/">
      <SiteShell activePath="/" navTone="dark" className="site-shell-home" mainHtml={homeHtml['zh-CN']} />
    </LanguageProvider>
  );
}
