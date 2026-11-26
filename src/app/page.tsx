import { LocaleProvider } from '../site/providers/i18n-context';
import { SiteShell } from '../site/components/shell';
import { HomeStaticMain } from '../site/components/home-static-main';
import { isReleaseReached } from '../site/components/hero-schedule';
import { metadataForRoute } from '../site/routing/metadata-base';
import { siteIdentity } from '../data/site';
import { humiteLaunch } from '../data/humite-launch.mjs';
import homeHtml from '../data/home-static.json';

export const metadata = metadataForRoute(
  { title: siteIdentity.researchName, description: siteIdentity.seoDescription },
  '/'
);

export default function Page() {
  const initialReleased = isReleaseReached(humiteLaunch);
  return (
    <LocaleProvider locale="zh-CN" path="/">
      <SiteShell activePath="/" navTone="dark" className="site-shell-home">
        <HomeStaticMain markup={homeHtml['zh-CN']} initialReleased={initialReleased} />
      </SiteShell>
    </LocaleProvider>
  );
}
