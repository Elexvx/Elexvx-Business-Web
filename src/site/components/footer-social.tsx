'use client';

import { useState } from 'react';
import { TikTokIcon, WechatIcon } from './inline-icons';
import { useI18n, type Locale } from '../providers/i18n-context';
import { useTheme } from '../providers/theme-provider';
import { SiteImage } from './site-image';

const channels = [
  {
    id: 'douyin',
    zh: '抖音',
    en: 'Douyin',
    qr: {
      light: '/images/douyin-follow-code.webp',
      dark: '/images/douyin-follow-code-dark.webp',
      size: 720,
    },
  },
  {
    id: 'wechat',
    zh: '微信公众号',
    en: 'WeChat Official Account',
    qr: {
      light: '/images/wechat-follow-code.webp',
      dark: '/images/wechat-follow-code-dark.webp',
      size: 656,
    },
  },
  {
    id: 'xiaohongshu',
    zh: '小红书',
    en: 'Xiaohongshu',
    qr: null,
  },
] as const;

type SocialChannelId = (typeof channels)[number]['id'];

const SocialChannelIcon = ({ channelId, locale }: { channelId: SocialChannelId; locale: Locale }) => {
  switch (channelId) {
    case 'douyin':
      return <TikTokIcon />;
    case 'wechat':
      return <WechatIcon />;
    case 'xiaohongshu':
      return (
        <span className="footer-social-rednote" aria-hidden="true">
          {locale === 'en' ? 'RED' : '小红书'}
        </span>
      );
  }
};

export const FooterSocial = () => {
  const { locale } = useI18n();
  const { theme } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const isEnglish = locale === 'en';
  return (
    <div className="footer-social" aria-label={isEnglish ? 'Social accounts' : '社交账号'}>
      {channels.map((channel) => {
        const label = isEnglish ? channel.en : channel.zh;
        const expanded = open === channel.id;
        return (
          <div
            className="footer-social-item"
            key={channel.id}
            onMouseEnter={() => setOpen(channel.id)}
            onMouseLeave={() => setOpen(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(null);
                event.stopPropagation();
              }
            }}
          >
            <button
              type="button"
              className="footer-social-trigger"
              aria-label={isEnglish ? `Follow on ${label}` : `${label}关注方式`}
              aria-expanded={expanded}
              aria-controls={`footer-social-${channel.id}`}
              onFocus={() => setOpen(channel.id)}
              onClick={() => setOpen(channel.id)}
            >
              <SocialChannelIcon channelId={channel.id} locale={locale} />
            </button>
            <div
              className={channel.qr ? 'footer-social-panel footer-social-panel-qr' : 'footer-social-panel'}
              id={`footer-social-${channel.id}`}
              hidden={!expanded}
            >
              <div className="footer-social-panel-heading">
                <strong>{label}</strong>
                {!channel.qr && <span>{isEnglish ? 'Demo' : '演示'}</span>}
              </div>
              {channel.qr ? (
                expanded && (
                  <SiteImage
                    className="footer-social-qr"
                    src={channel.qr[theme]}
                    alt={isEnglish ? `Hongxiang Shangdao ${label} QR code` : `宏翔商道${label}扫码图`}
                    width={channel.qr.size}
                    height={channel.qr.size}
                    loading="eager"
                  />
                )
              ) : (
                <>
                  <p className="footer-social-account">@elexvx_demo</p>
                  <p>
                    {isEnglish
                      ? `Open ${label}, search for the account ID, then select Follow.`
                      : `打开${label}，搜索上方账号，进入主页后点击关注。`}
                  </p>
                  <small>
                    {isEnglish ? 'Sample account for demonstration only.' : '示例账号，仅用于展示关注方式。'}
                  </small>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
