# Elexvx Research 官网

宏翔商道 / Elexvx 的研究优先型企业官网。`Elexvx Research` 是当前可替换的研究工作名称，不代表法定机构名称。

站点使用 React + Next.js App Router，以静态导出生成 HTML，直接采用 OpenAI 官网的黑色画布、白色高对比、编辑式内容节奏、扩展型导航和清晰的操作层级，并保留 Elexvx 自己的 Logo、名称与研究内容。全站统一使用黑色导航、黑色 / 深灰内容区和白色文字；不复制 OpenAI 的商标、字体文件或插画资产。

全站设计与内容发布必须遵循 [Elexvx 网站设计与内容发布规范](docs/openai-inspired-layout-notes.md)。该规范是当前唯一执行标准，包含首页四个发布分区、OpenAI 式编辑栅格、抽象渐变视觉、统一圆角、内容真实性边界和历史整改点总表。

## 信息架构

顶部导航采用“稳定入口 + 展开目录”的两层组织，参考 OpenAI 官网将多个产品/内容页面收纳在一级入口下的做法，但按本站内容重新命名；移动端使用可展开的分组目录。当前入口分为：

- 研究：研究总览、AI 与数据智能、工业智能与安全、LLM / AI 安全
- 能力：研发方法、数据与模型、工程验证、开放合作
- 成果：项目与产品、工业安全系统、项目状态、项目依据
- 场景：工业现场、知识工作、负责任的 AI 应用
- 阅读：技术文章、按方向阅读、旧文归档
- Elexvx：公司、团队、品牌、并行业务、加入我们、开放合作

页面主线为“研究方向 → 研发能力 → 项目成果 → 技术文章”。人力、知识产权和供应链继续保留为并行业务入口，不替代研究主叙事。

首页在首屏之后固定设置四个独立内容分区：

- 研究论文与技术文章
- 新闻发布
- 合作案例
- 产品展示

新闻与案例尚无核验内容时保留明确空状态；不得使用虚构客户、数据、成果或素材填充版面。

## 路由

```text
/                                   研究优先首页
/research                           研究方向总览
/research/:slug                     三个研究方向详情
/capabilities                       研发能力与流程
/projects                           产品与项目成果
/projects/:slug                     项目详情
/scenarios                          行业场景总览
/scenarios/:slug                    场景详情
/insights                           技术文章索引
/insights/:slug                     已发布文章详情
/news                               最新动态索引
/news/:slug                         新闻详情
/company                            公司与研究主体
/company/team                       团队
/company/brand                      品牌使用
/business                           并行业务
/business/:slug                     并行业务详情
/careers                            加入我们
/contact                            开放合作
/archive                            旧文章归档，noindex
```

旧服务、公司和文章路径通过静态重定向迁移到新信息架构；旧文章不参与首页主叙事。

## 开发

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run content:check
npm test
npm run build
npm run preview
```

`npm run dev` 使用 Next.js 开发服务器。`npm run build` 使用 Next.js 静态导出，将 App Router 页面输出为 `dist/<route>/index.html`，再运行 `scripts/generate-site.tsx` 补齐 `sitemap.xml`、`rss.xml`、`robots.txt` 和旧 URL 的重定向页面。`npm run preview` 使用本地静态服务器检查最终产物。

## 内容

内容目录为：

- `content/research`、`content/projects`、`content/company`：站点结构化资料
- `articles/insights`：独立维护的研究文章与技术记录
- `public/visuals`：首页、研究和项目卡片使用的独立视觉素材

当前自研 Markdown 管线主要用于 `articles/insights`，包括 frontmatter 校验、Markdown block / inline parser、危险 URL 拦截、草稿过滤、证据引用和文章页面生成。文章与站点代码分离维护，文章目录有自己的 [README](articles/README.md)。

新建文章：

```bash
npm run content:new -- --slug new-insight --title "文章标题"
```

已发布研究内容必须提供 `official`、`internal` 或 `asset` 证据引用，并将 `verified` 设为 `true`。未核验的数字、客户、荣誉和效果只保留在草稿或明确占位中。

## 目录说明

`src/app`、`src/content` 和 `src/styles` 是新的 React / Next.js App Router 运行层。`src/ssg` 与 `src/main.tsx` 暂时保留为迁移期兼容层；旧的 Astro 源文件仍保留在工作树中，用于过渡和历史内容参考，但不参与 Next.js 构建入口。
