'use client';
import { useRef, useState } from 'react';
import { WechatOutlined, LinkOutlined, QrcodeOutlined, CloseOutlined } from '@ant-design/icons';
import { useI18n } from '../providers/i18n';
import { configureWechat } from '../sharing/wechat';
export function ArticleShare() {
  const { locale } = useI18n();
  const en = locale === 'en';
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<'wechat' | 'link' | 'card'>('wechat');
  const [status, setStatus] = useState('');
  const [card, setCard] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const data = () => {
    const meta = (key: string) => document.querySelector<HTMLMetaElement>(`meta[property="${key}"]`)?.content || '';
    return {
      title: (meta('og:title') || document.title).replace(/ · Elexvx Research$/, ''),
      description: meta('og:description'),
      url: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || location.href.split('#')[0],
      image: new URL(meta('og:image') || '/share/elexvx.png', location.origin).href,
    };
  };
  const open = async (next: typeof mode) => {
    if (busy) return;
    const current = data();
    setMode(next);
    setUrl(current.url);
    setStatus('');
    dialog.current?.showModal();
    if (next === 'link') {
      try {
        await navigator.clipboard.writeText(current.url);
        setStatus(en ? 'Link copied.' : '网页链接已复制。');
      } catch {
        setStatus(en ? 'Select and copy the link below.' : '请长按或选中下方链接复制。');
      }
      return;
    }
    if (next === 'wechat') {
      if (!/MicroMessenger/i.test(navigator.userAgent)) {
        setStatus(
          en
            ? 'Open this article inside WeChat, then share from the top-right menu. You can also send a QR card.'
            : '请在手机微信内打开本文，再通过右上角「···」分享。也可以生成二维码卡片发送。'
        );
        return;
      }
      setBusy(true);
      setStatus(en ? 'Preparing WeChat sharing…' : '正在准备微信分享…');
      try {
        await configureWechat(current);
        setStatus(
          en
            ? 'Ready. Close this panel, then use ··· → Send to chat or Moments.'
            : '微信分享配置成功。关闭此窗口，再点击右上角「···」→ 发送给朋友或分享到朋友圈。'
        );
      } catch (error) {
        setStatus(
          (en ? 'WeChat sharing failed: ' : '微信分享配置失败：') +
            (error instanceof Error ? error.message : 'unknown') +
            (en ? '. You can use a QR card.' : '。可先使用二维码卡片分享。')
        );
      } finally {
        setBusy(false);
      }
      return;
    }
    if (card) return;
    setBusy(true);
    setStatus(en ? 'Creating card…' : '正在生成卡片…');
    try {
      const { createShareCard } = await import('../sharing/card');
      setCard(await createShareCard(current, en));
      setStatus(en ? 'Long-press to save, or download below.' : '长按图片保存，或点击下方下载，再发送给朋友。');
    } catch {
      setStatus(en ? 'Could not create card. Please try again.' : '卡片生成失败，请关闭后重试。');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <section className="article-share" aria-label={en ? 'Share article' : '转发文章'}>
        <span className="article-share-label">{en ? 'Share' : '转发'}</span>
        <div className="article-share-options">
          <button type="button" onClick={() => void open('wechat')} disabled={busy}>
            <WechatOutlined />
            <span>{en ? 'WeChat' : '微信'}</span>
          </button>
          <button type="button" onClick={() => void open('link')} disabled={busy}>
            <LinkOutlined />
            <span>{en ? 'Web link' : '网页'}</span>
          </button>
          <button type="button" onClick={() => void open('card')} disabled={busy}>
            <QrcodeOutlined />
            <span>{en ? 'QR card' : '二维码卡片'}</span>
          </button>
        </div>
      </section>
      <dialog
        ref={dialog}
        className="article-share-dialog"
        aria-label={en ? 'Share article' : '转发文章'}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <header>
          <h2>
            {mode === 'wechat'
              ? en
                ? 'Share to WeChat'
                : '分享到微信'
              : mode === 'link'
                ? en
                  ? 'Web link'
                  : '网页链接'
                : en
                  ? 'QR card'
                  : '二维码卡片'}
          </h2>
          <button type="button" aria-label={en ? 'Close' : '关闭'} onClick={() => dialog.current?.close()}>
            <CloseOutlined />
          </button>
        </header>
        <p role="status">{status}</p>
        {mode === 'link' && (
          <input
            aria-label={en ? 'Page link' : '页面链接'}
            value={url}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        {mode === 'wechat' && !busy && (
          <button className="article-share-secondary" onClick={() => void open('card')}>
            {en ? 'Create QR card' : '生成二维码卡片'}
          </button>
        )}
        {mode === 'card' && card && (
          <div className="article-share-card">
            <img src={card} alt={en ? 'Article card with QR code' : '包含文章标题、封面和二维码的分享卡片'} />
            <a href={card} download="elexvx-share.png">
              {en ? 'Download card' : '下载卡片'}
            </a>
          </div>
        )}
      </dialog>
    </>
  );
}
