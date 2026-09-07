'use client';

import { useEffect, useRef, useState } from 'react';
import { ShareAltOutlined, CopyOutlined, DownloadOutlined, CloseOutlined, WechatOutlined } from '@ant-design/icons';
import { useI18n } from '../providers/i18n';
import { shareDataFromDocument, type ShareData } from '../sharing/card';
import { configureWechat } from '../sharing/wechat';

export function SiteShare() {
  const { locale } = useI18n();
  const en = locale === 'en';
  const dialog = useRef<HTMLDialogElement>(null);
  const link = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ShareData | null>(null);
  const [card, setCard] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [wechat, setWechat] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => {
    const current = shareDataFromDocument();
    setData(current);
    setWechat(/MicroMessenger/i.test(navigator.userAgent));
    setNative(typeof navigator.share === 'function');
    configureWechat(current).catch(() => {
      /* Link, QR and poster remain available without SDK. */
    });
  }, []);
  const open = () => {
    setStatus('');
    dialog.current?.showModal();
  };
  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setStatus(en ? 'Link copied' : '链接已复制');
    } catch {
      link.current?.focus();
      link.current?.select();
      setStatus(en ? 'Select and copy the link below.' : '请长按或手动复制下方链接。');
    }
  };
  const generate = async () => {
    if (!data || busy) return;
    setBusy(true);
    setStatus('');
    try {
      const { createShareCard } = await import('../sharing/card');
      setCard(await createShareCard(data, en));
    } catch {
      setStatus(en ? 'Unable to create the card. Please try again.' : '卡片生成失败，请重试。');
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    if (!data) return;
    try {
      await navigator.share({ title: data.title, text: data.description, url: data.url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        setStatus(en ? 'Please copy the link or save a card instead.' : '暂时无法调用系统分享，请复制链接或保存卡片。');
    }
  };
  return (
    <>
      <button
        className="site-share-trigger"
        type="button"
        onClick={open}
        aria-label={en ? 'Share this page' : '分享此页'}
      >
        <ShareAltOutlined />
        <span>{en ? 'Share' : '分享'}</span>
      </button>
      <dialog
        className="site-share-dialog"
        ref={dialog}
        aria-labelledby="site-share-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="site-share-content">
          <header>
            <div>
              <p className="site-share-eyebrow">ELEXVX / SHARE</p>
              <h2 id="site-share-title">{en ? 'Worth sharing' : '分享，让想法相遇'}</h2>
            </div>
            <button
              type="button"
              className="site-share-close"
              onClick={() => dialog.current?.close()}
              aria-label={en ? 'Close sharing' : '关闭分享'}
            >
              <CloseOutlined />
            </button>
          </header>
          {data && (
            <section className="site-share-preview">
              <strong>{data.title}</strong>
              <p>{data.description}</p>
              <small>www.elexvx.com</small>
            </section>
          )}
          <p className="site-share-hint">
            <WechatOutlined />
            {wechat
              ? en
                ? 'Tap ··· at the top right to share with friends or Moments. You can also save the card below.'
                : '点击微信右上角「···」，选择发送给朋友或分享到朋友圈；也可以保存下方卡片。'
              : en
                ? 'Save a card to send in WeChat, or scan its QR code to open this page.'
                : '保存卡片发送到微信，好友可长按识别二维码打开页面。'}
          </p>
          <div className="site-share-actions">
            <button type="button" onClick={copy}>
              <CopyOutlined />
              {en ? 'Copy link' : '复制链接'}
            </button>
            {native && !wechat && (
              <button type="button" onClick={share}>
                <ShareAltOutlined />
                {en ? 'System share' : '系统分享'}
              </button>
            )}
            <button type="button" onClick={generate} disabled={busy}>
              <DownloadOutlined />
              {busy ? (en ? 'Creating…' : '生成中…') : en ? 'Create card' : '生成分享卡片'}
            </button>
          </div>
          <input
            ref={link}
            className="site-share-url"
            value={data?.url || ''}
            readOnly
            aria-label={en ? 'Page link' : '页面链接'}
          />
          <p role="status" className="site-share-status">
            {status}
          </p>
          {card && (
            <section className="site-share-poster">
              <img src={card} alt={en ? 'Share card with a QR code to this page' : '附有本页二维码的分享卡片'} />
              <p>
                {en ? 'Long-press the image to save it in WeChat.' : '微信内长按图片即可保存，再发送给朋友或朋友圈。'}
              </p>
              <a download="elexvx-share.png" href={card}>
                {en ? 'Download card' : '下载分享卡片'}
              </a>
            </section>
          )}
        </div>
      </dialog>
    </>
  );
}
