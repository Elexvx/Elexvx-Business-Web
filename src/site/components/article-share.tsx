'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { LinkOutlined, QrcodeOutlined, CloseOutlined } from '@ant-design/icons';
import { Dialog } from 'radix-ui';
import { useI18n } from '../providers/i18n';
import { shareDataFromDocument } from '../sharing/card';
import { ModalContent } from './primitives/modal';

type ShareMode = 'link' | 'card';
type CardTask = { key: string; result: Promise<string>; value?: string };

export function ArticleShare() {
  const { locale } = useI18n();
  const en = locale === 'en';
  const dialogId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const cardTaskRef = useRef<CardTask | null>(null);
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<ShareMode>('card');
  const [status, setStatus] = useState('');
  const [card, setCard] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    []
  );

  const close = () => {
    requestRef.current += 1;
    setOpened(false);
    setBusy(false);
    setStatus('');
  };

  const open = async (next: ShareMode, trigger?: HTMLElement) => {
    const request = ++requestRef.current;
    if (trigger) triggerRef.current = trigger;
    const current = shareDataFromDocument();
    setMode(next);
    setUrl(current.url);
    setStatus('');
    setCard('');
    setBusy(false);
    setOpened(true);
    if (next === 'link') {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(current.url);
        if (request === requestRef.current) setStatus(en ? 'Link copied.' : '网页链接已复制。');
      } catch {
        if (request === requestRef.current) {
          setStatus(en ? 'Select and copy the link below.' : '请长按或选中下方链接复制。');
        }
      }
      return;
    }

    const key = JSON.stringify([locale, current]);
    const savedHint = en ? 'Long-press to save, or download below.' : '长按图片保存，或点击下方下载，再发送给朋友。';
    let task = cardTaskRef.current;
    if (task?.key !== key) {
      task = { key, result: import('../sharing/card').then(({ createShareCard }) => createShareCard(current, locale)) };
      cardTaskRef.current = task;
    }
    if (task.value) {
      setCard(task.value);
      setStatus(savedHint);
      return;
    }

    setBusy(true);
    setStatus(en ? 'Creating card…' : '正在生成卡片…');
    try {
      task.value = await task.result;
      if (request !== requestRef.current) return;
      setCard(task.value);
      setStatus(savedHint);
    } catch {
      if (cardTaskRef.current === task) cardTaskRef.current = null;
      if (request === requestRef.current) {
        setStatus(
          en ? 'Could not create card. Try again or copy the link below.' : '卡片生成失败，请重试，或复制下方链接分享。'
        );
      }
    } finally {
      if (request === requestRef.current) setBusy(false);
    }
  };

  return (
    <Dialog.Root
      open={opened}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <section className="article-share" aria-label={en ? 'Share article' : '转发文章'}>
        <span className="article-share-label">{en ? 'Share' : '转发'}</span>
        <div className="article-share-options">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls={dialogId}
            onClick={(event) => void open('link', event.currentTarget)}
          >
            <LinkOutlined aria-hidden="true" />
            <span>{en ? 'Web link' : '网页'}</span>
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls={dialogId}
            onClick={(event) => void open('card', event.currentTarget)}
          >
            <QrcodeOutlined aria-hidden="true" />
            <span>{en ? 'QR card' : '二维码卡片'}</span>
          </button>
        </div>
      </section>
      <ModalContent
        id={dialogId}
        returnFocusRef={triggerRef}
        className="article-share-dialog"
        onOpenAutoFocus={(event) => {
          if (mode !== 'link' || !inputRef.current) return;
          event.preventDefault();
          inputRef.current.focus();
          inputRef.current.select();
        }}
      >
        <header>
          <Dialog.Title asChild>
            <h2>{mode === 'link' ? (en ? 'Web link' : '网页链接') : en ? 'QR card' : '二维码卡片'}</h2>
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label={en ? 'Close' : '关闭'}>
              <CloseOutlined aria-hidden="true" />
            </button>
          </Dialog.Close>
        </header>
        <Dialog.Description asChild>
          <p role="status" aria-atomic="true">
            {status}
          </p>
        </Dialog.Description>
        {(mode === 'link' || (!busy && !card)) && (
          <input
            ref={inputRef}
            aria-label={en ? 'Page link' : '页面链接'}
            value={url}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        {mode === 'card' && !busy && !card && (
          <button className="article-share-retry" type="button" onClick={() => void open('card')}>
            {en ? 'Try again' : '重新生成'}
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
      </ModalContent>
    </Dialog.Root>
  );
}
