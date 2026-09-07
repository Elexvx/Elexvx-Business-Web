'use client';
import { useEffect } from 'react';
import { configureWechat } from '../sharing/wechat';
export function WechatShareInit({ path }: { path: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const meta = (key: string) => document.querySelector<HTMLMetaElement>(`meta[property="${key}"]`)?.content || '';
      void configureWechat({
        title: meta('og:title') || document.title,
        description: meta('og:description'),
        url: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || location.href.split('#')[0],
        image: new URL(meta('og:image') || '/share/elexvx.png', location.origin).href,
      }).catch(() => {
        /* WeChat may reject configuration; ordinary navigation remains available. */
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [path]);
  return null;
}
