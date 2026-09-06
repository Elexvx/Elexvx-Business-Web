import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './site/App';
import { browserInsights, browserNews } from './content/browser';
import './styles/apple-system.css';

const rootElement = document.getElementById('app');
const browserPath = window.location.pathname || '/';
const locale = browserPath === '/en' || browserPath.startsWith('/en/') ? 'en' : 'zh-CN';
const path = locale === 'en' ? browserPath.replace(/^\/en(?=\/|$)/, '') || '/' : browserPath;
const app = <App path={path} insights={browserInsights} news={browserNews} locale={locale} />;

if (rootElement?.firstElementChild) {
  hydrateRoot(rootElement, app, {
    onRecoverableError: (error, info) => {
      console.error(error, info.componentStack);
    },
  });
} else if (rootElement) {
  createRoot(rootElement).render(app);
}
