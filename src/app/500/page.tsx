import { ErrorPage } from '../../site/components/error-page';
import { metadataForRoute } from '../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: '页面暂时遇到了一点问题',
    description: '请稍后重试，或先返回首页。如果问题持续出现，欢迎联系我们。',
    robots: 'noindex,nofollow',
  },
  '/500'
);
export default function Page() {
  return <ErrorPage code={500} />;
}
