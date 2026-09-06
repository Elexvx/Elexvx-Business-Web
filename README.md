# Elexvx Research 官网

React + Next.js App Router + Radix Primitives 构建的中英文研究与企业门户。

## 开发与检查

```sh
npm install
npm run dev        # http://127.0.0.1:5173
npm run check      # 类型、Lint、格式、内容、测试、构建
npm run preview    # 静态产物预览
```

## 目录职责

| 目录 | 内容 |
| --- | --- |
| src/app | Next.js 路由入口、根布局、404 |
| src/site/pages | 首页、研究、产品、文章、公司页面实现 |
| src/site/components | 导航、页脚、公共 UI、搜索、Cookie |
| src/site/providers | 语言、主题、内容状态 |
| src/site/routing | 路由目录、重定向、SEO |
| src/data | 文案、导航、结构化展示配置 |
| src/content | Markdown 读取、解析、校验 |
| src/styles | 样式入口和有序分区 |
| articles | 当前研究文章与新闻 |
| content/site | 正式 catalog.json |
| public | 对外提供的品牌、配图和产品 PNG |
| scripts / tests | 构建与内容工具、自动化测试 |
| docs | 架构和设计说明 |
| parked-pages | 下线页面内容与恢复说明 |
| archive | 旧 Astro 源码、旧设计，不参与现行构建 |
| posts | 历史文章迁移输入 |

## 常用修改入口

- 首页文案与产品顺序：src/data/page-content.ts。
- 首页布局：src/site/pages/home.tsx。
- 导航：src/data/research-navigation.ts、src/site/components/navigation.tsx。
- 页脚：src/data/site.ts、src/site/components/footer.tsx。
- 有效路由：src/site/routing/routes.tsx。
- 样式：src/styles/apple-system.css 只负责按顺序导入分区。

详细说明见 [项目结构](docs/architecture/project-structure.md)，设计与内容要求见 [发布规范](docs/openai-inspired-layout-notes.md)。
