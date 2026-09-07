'use client';

import { Translated } from '../providers/i18n';
import { CompanyIntro } from '../components/company-intro';
import { SiteShell } from '../components/index';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import document from '../../data/design-document.json';

const sections = document.source.replace(/^# .*\n/, '').split(/^## /m);
const introduction = sections.shift()?.trim();

const typographyRows = [
  {
    label: '主标题 H1',
    sample: '想象力，真的没有边界',
    token: 'clamp(40px, 5vw, 64px) · 字重 500 · 行高 1.05',
    className: 'design-sample-large',
  },
  {
    label: '模块标题 H2',
    sample: '探索研究与产品',
    token: 'clamp(28px, 2.7vw, 36px) · 字重 500 · 行高 1.25',
    className: 'design-sample-medium',
  },
  {
    label: '小标题 H3／卡片标题',
    sample: '从问题出发，清晰表达',
    token: '20px / 手机 18px · 字重 500 · 行高 1.35',
    className: 'design-sample-small',
  },
  {
    label: '默认正文',
    sample: '每一次表达，都应保持清楚、一致、可辨认。',
    token: '17px · 字重 400 · 行高 1.65',
    className: 'design-sample-body',
  },
] as const;

const colorTokens = [
  { label: '默认画布', token: '--color-canvas', color: 'var(--color-canvas)' },
  { label: '内容底色', token: '--color-parchment', color: 'var(--color-parchment)' },
  { label: '主要文字', token: '--color-ink', color: 'var(--color-ink)' },
  { label: '辅助文字', token: '--color-ink-muted', color: 'var(--color-ink-muted)' },
  { label: '操作强调', token: '--color-action', color: 'var(--color-action)' },
] as const;

const spacingTokens = [
  { label: '紧凑元信息', value: 8 },
  { label: '元素内边距', value: 16 },
  { label: '卡片间距', value: 24 },
  { label: '内容组间距', value: 32 },
  { label: '页面进入', value: 80 },
] as const;

const splitSection = (section: string) => {
  const newline = section.indexOf('\n');
  return {
    title: newline === -1 ? section : section.slice(0, newline),
    body: newline === -1 ? '' : section.slice(newline + 1),
  };
};

export const DesignPage = () => {
  return (
    <SiteShell activePath="/company/design">
      <article className="design-guide">
        <CompanyIntro
          eyebrow="ELEXVX DESIGN"
          title="官网设计规范"
          description="从信息层级到页面边界，让复杂内容保持清楚、安静、可读。"
        >
          <a className="design-download" href="/company/design/design.md" download="design.md">
            <Translated>{'下载 design.md ↓'}</Translated>
          </a>
        </CompanyIntro>

        <section className="design-section design-specimen-section" aria-labelledby="design-specimens-title">
          <div className="design-section-heading">
            <div>
              <p className="design-kicker">
                <Translated>{'01 · 视觉样板'}</Translated>
              </p>
              <h2 id="design-specimens-title">
                <Translated>{'可直接使用的视觉样板'}</Translated>
              </h2>
            </div>
            <p>
              <Translated>{'把规范写成真实的界面元素，查看每个尺寸在页面中的实际表现。'}</Translated>
            </p>
          </div>

          <div className="design-specimen-grid">
            <article className="design-specimen-card design-typography-card">
              <header className="design-card-heading">
                <div>
                  <p className="design-card-kicker">
                    <Translated>{'文字层级'}</Translated>
                  </p>
                  <h3>
                    <Translated>{'同一套字号，覆盖页面与卡片'}</Translated>
                  </h3>
                </div>
                <span className="design-card-index">01</span>
              </header>
              <div className="design-type-stack">
                {typographyRows.map((row) => (
                  <div className="design-type-row" key={row.label}>
                    <span className="design-type-label">
                      <Translated>{row.label}</Translated>
                    </span>
                    <div className={row.className}>
                      <Translated>{row.sample}</Translated>
                    </div>
                    <small>
                      <Translated>{row.token}</Translated>
                    </small>
                  </div>
                ))}
              </div>
            </article>

            <article className="design-specimen-card design-color-card">
              <header className="design-card-heading">
                <div>
                  <p className="design-card-kicker">
                    <Translated>{'颜色令牌'}</Translated>
                  </p>
                  <h3>
                    <Translated>{'颜色跟随主题变量'}</Translated>
                  </h3>
                </div>
                <span className="design-card-index">02</span>
              </header>
              <ul className="design-color-list">
                {colorTokens.map((color) => (
                  <li key={color.token}>
                    <span className="design-color-swatch" style={{ background: color.color }} aria-hidden="true" />
                    <span>
                      <strong>
                        <Translated>{color.label}</Translated>
                      </strong>
                      <small>{color.token}</small>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="design-card-note">
                <Translated>{'颜色由主题变量控制，正文不添加装饰性彩色字。'}</Translated>
              </p>
            </article>

            <article className="design-specimen-card design-spacing-card">
              <header className="design-card-heading">
                <div>
                  <p className="design-card-kicker">
                    <Translated>{'间距刻度'}</Translated>
                  </p>
                  <h3>
                    <Translated>{'让页面呼吸，也让边界对齐'}</Translated>
                  </h3>
                </div>
                <span className="design-card-index">03</span>
              </header>
              <div className="design-spacing-list">
                {spacingTokens.map((space) => (
                  <div className="design-spacing-row" key={space.value}>
                    <span className="design-spacing-bar" style={{ width: `${Math.max(16, space.value * 1.5)}px` }} />
                    <strong>{space.value}px</strong>
                    <span>
                      <Translated>{space.label}</Translated>
                    </span>
                  </div>
                ))}
              </div>
              <p className="design-card-note">
                <Translated>{'新增页面优先复用共享变量，不为单个页面增加间距补丁。'}</Translated>
              </p>
            </article>

            <article className="design-specimen-card design-component-card">
              <header className="design-card-heading">
                <div>
                  <p className="design-card-kicker">
                    <Translated>{'常用组件'}</Translated>
                  </p>
                  <h3>
                    <Translated>{'组件先保证信息清楚'}</Translated>
                  </h3>
                </div>
                <span className="design-card-index">04</span>
              </header>
              <div className="design-component-preview">
                <button type="button" className="design-button">
                  <Translated>{'主要按钮'}</Translated>
                </button>
                <a className="design-text-link" href="#design-reference">
                  <Translated>{'次级链接'}</Translated>
                  <span aria-hidden="true">→</span>
                </a>
                <div className="design-meta-row">
                  <span>
                    <Translated>{'芯片架构'}</Translated>
                  </span>
                  <span>2026-09-06</span>
                </div>
              </div>
              <ul className="design-point-list">
                <li>
                  <Translated>{'图片、标题、分类和日期保持同一条内容边界。'}</Translated>
                </li>
                <li>
                  <Translated>{'卡片只承担阅读、图片或交互需要的独立边界。'}</Translated>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="design-section design-layout-section" aria-labelledby="design-layout-title">
          <div className="design-section-heading">
            <div>
              <p className="design-kicker">
                <Translated>{'02 · 页面结构'}</Translated>
              </p>
              <h2 id="design-layout-title">
                <Translated>{'先建立层级，再组织内容'}</Translated>
              </h2>
            </div>
            <p>
              <Translated>{'每个模块共享同一条内容边界，卡片只承担清晰的阅读和交互任务。'}</Translated>
            </p>
          </div>
          <div className="design-wireframe">
            <div>
              <Translated>{'全局导航'}</Translated>
            </div>
            <div>
              <Translated>{'H1 页面主标题'}</Translated>
              <span>
                <Translated>{'顶部 80px / 手机 48px'}</Translated>
              </span>
            </div>
            <div>
              <Translated>{'二级分类'}</Translated>
              <span>
                <Translated>{'上下间隔 32px'}</Translated>
              </span>
            </div>
            <div className="design-wire-cards">
              {[1, 2, 3].map((index) => (
                <span key={index}>
                  <Translated>{'内容卡片'}</Translated>
                  <small>0{index}</small>
                </span>
              ))}
            </div>
            <div>
              <Translated>{'统一页脚'}</Translated>
            </div>
          </div>
          <p className="design-layout-note">
            <Translated>{'普通内容最大宽度 1440px；左右留白 32px，手机端 20px。首页 Hero 单独通栏展示。'}</Translated>
          </p>
        </section>

        <section
          id="design-reference"
          className="design-section design-reference"
          aria-labelledby="design-reference-title"
        >
          <div className="design-section-heading">
            <div>
              <p className="design-kicker">
                <Translated>{'03 · 可展开的完整规范'}</Translated>
              </p>
              <h2 id="design-reference-title">
                <Translated>{'完整规范正文'}</Translated>
              </h2>
            </div>
            <p>
              <Translated>{'把详细规则按主题拆开，先看样板，再展开需要核对的部分。'}</Translated>
            </p>
          </div>

          {introduction && (
            <p className="design-version">
              <Translated>{introduction}</Translated>
            </p>
          )}

          <div className="design-rule-grid">
            {sections.map((section, index) => {
              const { title, body } = splitSection(section);
              return (
                <details className="design-rule-card" key={title}>
                  <summary>
                    <span className="design-rule-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="design-rule-title">
                      <Translated>{title}</Translated>
                    </span>
                    <span className="design-rule-toggle" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="design-rule-card-body">
                    <MarkdownRenderer source={body} />
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </article>
    </SiteShell>
  );
};
