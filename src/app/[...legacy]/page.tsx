import { notFound } from 'next/navigation';
import { redirectRoutes } from '../routes';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(redirectRoutes).map((path) => ({ legacy: path.replace(/^\//, '').split('/') }));
}

export default async function Page({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const source = `/${legacy.join('/')}`;
  const target = redirectRoutes[source];
  if (!target) notFound();

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '48px',
        color: '#fff',
        background: '#000',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <p>
        页面已移动到 <a href={target}>新页面</a>。
      </p>
    </main>
  );
}
