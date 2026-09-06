'use client';
import { SiteShell } from '../components/index';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import document from '../../data/design-document.json';

export const DesignPage = () => (
  <SiteShell activePath="/company/design">
    <article className="design-guide">
      <header className="design-guide-header">
        <p>公司 / 设计规范</p>
        <h1>官网设计规范</h1>
        <p>从信息层级到页面边界，让每个页面遵循同一套设计语言。</p>
        <a className="design-download" href="/company/design/design.md" download="design.md">下载 design.md ↓</a>
      </header>
      <section className="design-specimens" aria-label="标题实际字号示例">
        <div><span>01 · 主标题</span><p className="design-sample-large">想象力，真的没有边界</p><small>36–64px · 字重 500 · 行高 1.15</small></div>
        <div><span>02 · 中标题</span><p className="design-sample-medium">探索研究与产品</p><small>24–32px · 字重 500 · 行高 1.3</small></div>
        <div><span>03 · 小标题</span><p className="design-sample-small">从问题出发，清晰表达</p><small>20px / 手机 18px · 行高 1.45</small></div>
      </section>
      <section className="design-layout-example" aria-label="页面结构示意">
        <h2>先建立层级，再组织内容</h2>
        <div className="design-wireframe">
          <div>全局导航</div><div>H1 页面主标题 <span>顶部 64px / 手机 40px</span></div>
          <div>二级分类 <span>上下间隔 32px</span></div>
          <div className="design-wire-cards"><span>内容卡片</span><span>内容卡片</span><span>内容卡片</span></div>
          <div>统一页脚</div>
        </div>
        <p>普通内容最大宽度 1440px；左右留白 32px，手机端 20px。首页 Hero 单独通栏展示。</p>
      </section>
      <div className="design-document"><MarkdownRenderer source={document.source.replace(/^# .*\n/, '')} /></div>
    </article>
  </SiteShell>
);
