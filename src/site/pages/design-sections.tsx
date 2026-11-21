import type { ReactNode } from 'react';

import {
  colorTokens,
  designIntroduction,
  designSections,
  spacingTokens,
  typographyRows,
} from '../../data/design-specimens';
import { MarkdownRenderer } from '../components/lazy-markdown-renderer';
import { Translated } from '../providers/i18n';

const SPACING_BAR_SCALE = 1.5;
const MIN_SPACING_BAR_WIDTH_PX = 16;

const DesignSpecimenCard = ({
  className,
  kicker,
  title,
  index,
  children,
}: {
  className: string;
  kicker: string;
  title: string;
  index: string;
  children: ReactNode;
}) => (
  <article className={`design-specimen-card ${className}`}>
    <header className="design-card-heading">
      <div>
        <p className="design-card-kicker">
          <Translated>{kicker}</Translated>
        </p>
        <h3>
          <Translated>{title}</Translated>
        </h3>
      </div>
      <span className="design-card-index">{index}</span>
    </header>
    {children}
  </article>
);

export const DesignSpecimenSection = () => (
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
      <DesignSpecimenCard
        className="design-typography-card"
        kicker="文字层级"
        title="同一套字号，覆盖页面与卡片"
        index="01"
      >
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
      </DesignSpecimenCard>

      <DesignSpecimenCard className="design-color-card" kicker="颜色令牌" title="颜色跟随主题变量" index="02">
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
      </DesignSpecimenCard>

      <DesignSpecimenCard className="design-spacing-card" kicker="间距刻度" title="让页面呼吸，也让边界对齐" index="03">
        <div className="design-spacing-list">
          {spacingTokens.map((space) => (
            <div className="design-spacing-row" key={space.value}>
              <span
                className="design-spacing-bar"
                style={{ width: `${Math.max(MIN_SPACING_BAR_WIDTH_PX, space.value * SPACING_BAR_SCALE)}px` }}
              />
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
      </DesignSpecimenCard>

      <DesignSpecimenCard className="design-component-card" kicker="常用组件" title="组件先保证信息清楚" index="04">
        <div className="design-component-preview">
          <button type="button" className="design-button">
            <Translated>{'主要按钮'}</Translated>
          </button>
          <a className="design-text-link" href="#design-reference">
            <Translated>{'次级链接'}</Translated>
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
      </DesignSpecimenCard>
    </div>
  </section>
);

export const DesignLayoutSection = () => (
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
          <Translated>{'顶部 32–48px 响应式'}</Translated>
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
);

export const DesignReferenceSection = () => (
  <section id="design-reference" className="design-section design-reference" aria-labelledby="design-reference-title">
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

    {designIntroduction && (
      <p className="design-version">
        <Translated>{designIntroduction}</Translated>
      </p>
    )}

    <div className="design-rule-grid">
      {designSections.map(({ title, body }, index) => (
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
      ))}
    </div>
  </section>
);
