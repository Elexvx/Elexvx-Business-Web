# 内容与页面架构

网站现在按“模板、参数、文章”三层维护，页面组件不再自行保存业务数据。

## 1. 页面模板

- `src/site/pages/`：只负责页面结构与组件组合。
- `src/site/components/`：全局导航、Hero、内容区块、卡片和页脚等共享组件。
- `src/styles/apple-system.css`：全站统一的 OpenAI 式视觉和响应式规则。

总览页、详情页和文章页共用固定进入节奏：全局导航 → 居中标题与动作 → 主视觉 → 页面正文。

## 2. 可变参数

- `src/data/page-content.ts`：首页、各类子页面的标题、说明、按钮、状态和主视觉参数。
- `src/data/research-navigation.ts`：顶部导航分组、栏目和链接。
- `content/site/catalog.json`：研究方向、研发能力、项目、场景、并行业务、公司信息和页脚。
- `src/data/site.ts`：读取并校验 `catalog.json`，不保存业务文案。

修改研究方向、项目或业务数据时，优先编辑 `content/site/catalog.json`；修改页面叙事和主视觉时，编辑 `src/data/page-content.ts`；不要在 React 页面中直接增加业务文案。

`npm run content:check` 会检查重复 slug、项目引用关系、页面参数完整性和主视觉文件是否存在。

## 3. 独立文章

- `articles/insights/*.md`：每篇研究文章单独维护正文和 frontmatter。
- `articles/news/*.md`：公司公告、业务动态和旧站迁移文章；使用同一套 Markdown parser，但和研究文章保持独立内容集合。
- 草稿不会生成公开页面。
- `cover` 控制文章页主视觉。
- `evidence` 控制研究文章的公开依据；新闻文章保留 `legacyPath` 和 `sourceUrl`，标明旧站来源。

首页研究文章区只读取 `status: published` 的研究文章；首页最新动态读取 `articles/news/` 中最近 6 条已发布新闻，`/news` 页面展示全部。

## 后续接入 CMS 或数据库

页面模板不需要改变。只需把 `src/data/site.ts` 的读取来源替换为 CMS、数据库或构建时 API，并保持现有 `ResearchDirection`、`Project`、`Scenario` 和 `BusinessLine` 数据结构即可。
