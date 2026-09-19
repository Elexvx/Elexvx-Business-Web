import { ErrorPage } from '../../site/components/error-page';
import { metadataForRoute } from '../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: '此处暂不开放访问',
    description: '你暂时无法访问此页面。如需了解相关内容，请与我们联系。',
    robots: 'noindex,nofollow',
  },
  '/403'
);
export default function Page() {
  return <ErrorPage code={403} />;
}
