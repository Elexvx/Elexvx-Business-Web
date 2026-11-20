import { serviceNavigationConfig } from '../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../data/site-origins';
import { SiteShell } from '../../site/components/shell';
import { serviceMetadata } from '../../site/routing/metadata-base';
import { StatusPage } from '../../site/services/status-page';

export const metadata = serviceMetadata({
  title: '服务状态',
  description: serviceNavigationConfig.status.description,
  path: '/status/',
});

export default function Page() {
  return (
    <SiteShell
      activePath="/status"
      className="service-site-shell status-performance-shell"
      linkOrigin={CANONICAL_ORIGIN}
    >
      <StatusPage />
    </SiteShell>
  );
}
