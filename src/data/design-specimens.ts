import document from './design-document.json';

const rawSections = document.source.replace(/^# .*\n/, '').split(/^## /m);

export const designIntroduction = rawSections[0]?.trim() ?? '';

export const designSections = rawSections.slice(1).map((section) => {
  const newline = section.indexOf('\n');
  return {
    title: newline === -1 ? section : section.slice(0, newline),
    body: newline === -1 ? '' : section.slice(newline + 1),
  };
});

export const typographyRows = [
  {
    label: '主标题 H1',
    sample: '想象力，真的没有边界',
    token: '32–56px · 字重 500 · 行高 1.08',
    className: 'design-sample-large',
  },
  {
    label: '模块标题 H2（样板）',
    sample: '探索研究与产品',
    token: '24–36px · 字重 500 · 行高 1.25',
    className: 'design-sample-medium',
  },
  {
    label: '卡片标题 H3（样板）',
    sample: '从问题出发，清晰表达',
    token: '17–20px · 字重 500 · 行高 1.35',
    className: 'design-sample-small',
  },
  {
    label: '默认正文',
    sample: '每一次表达，都应保持清楚、一致、可辨认。',
    token: '15–17px · 字重 400 · 行高 1.65',
    className: 'design-sample-body',
  },
] as const;

export const colorTokens = [
  { label: '默认画布', token: '--color-canvas', color: 'var(--color-canvas)' },
  { label: '内容底色', token: '--color-parchment', color: 'var(--color-parchment)' },
  { label: '主要文字', token: '--color-ink', color: 'var(--color-ink)' },
  { label: '辅助文字', token: '--color-ink-muted', color: 'var(--color-ink-muted)' },
  { label: '操作强调', token: '--color-action', color: 'var(--color-action)' },
] as const;

export const spacingTokens = [
  { label: '紧凑元信息', value: 8 },
  { label: '元素内边距', value: 16 },
  { label: '卡片间距', value: 24 },
  { label: '内容组间距', value: 32 },
  { label: '页面进入（32–48px 响应式，此处示意上限）', value: 48 },
] as const;
