# Elexvx Research 官网

React + Next.js App Router + Radix Primitives 构建的中英文研究与企业门户。

## 开发与检查

```sh
npm install
npm run dev        # http://127.0.0.1:5173
npm run check      # 类型、Lint、格式、内容、测试、构建
npm run preview    # 静态产物预览
```

## 公开页面部署

ESA 项目 `elexvx-site-router` 统一托管页面、静态资源和接口，连接本仓库的 `main` 分支，构建根目录为 `/`，使用 Node.js 24、`npm ci` 和 `npm run build:esa` 自动构建并发布。`esa.jsonc` 同时指定函数入口 `./esa/site/index.js` 与静态目录 `./esa/site/assets`，没有配置 SPA 回退。

构建将 `dist` 复制到同一项目的静态目录，页面、JS、CSS 和图片由 ESA 原生静态分发，函数只处理接口、旧网址跳转及缺失页面；不读取另一项目或回源 Vercel。旧网址的静态回退文件从 ESA 产物移除，以确保函数返回永久重定向；域名入口、分站 robots/sitemap 和分类查询使用站点的原生重定向规则，优先于静态资源分发；函数路由仅作为缺失资源的回退。ESA 会优先响应存在的静态文件，不能依靠函数路由覆盖它们。网站内容保持静态发布，未新增用户账号系统。`npm run build` 仍生成可独立预览的 `dist`。

函数生产变量 `UPTIMEROBOT_API_KEY` 应使用加密存储。`INDEXNOW_KV_NAMESPACE=elexvx_indexnow` 指定 ESA KV 回执空间；构建生成的 `indexnow-manifest.json` 在内容变化后更新版本，静态页面访问 `/api/publish/`，由函数异步提交构建时固定的文章和集合 URL，成功回执避免重复提交。可选的 `CRON_SECRET` 仅用于保护手动通知接口，不需要 Vercel Cron。提交成功不等于搜索引擎实际收录。

2026-10-03 已切换正式域名：`www`、`ai`、`nav`、`status` 和泛域名由 `elexvx-site-router` 承担，旧的公开页面分段路由和 Vercel 回源规则已停用。根域名保留邮箱 MX/TXT，用 ESA 代理 DNS 配合原生重定向规则返回 308 到 `www`；不访问旧 Vercel 源站。监控密钥已加密保存并发布，状态与历史数据从 ESA 接口读取。正式站 153 个页面、370 个资源通过检查，中国、美国、德国、新加坡、澳大利亚探针返回 HTTP 200。Vercel 项目已暂停，定时执行已关闭，Git 自动部署连接已断开；邮箱、`bp`、`docs`、`acc` 属于其他业务入口并保留。

## 目录职责

| 目录                | 内容                                  |
| ------------------- | ------------------------------------- |
| src/app             | Next.js 路由入口、根布局、404         |
| src/site/pages      | 首页、研究、产品、文章、公司页面实现  |
| src/site/components | 导航、页脚、公共 UI、搜索、Cookie     |
| src/site/providers  | 语言、主题、内容状态                  |
| src/site/routing    | 路由目录、重定向、SEO                 |
| src/data            | 文案、导航、结构化展示配置            |
| src/content         | Markdown 读取、解析、校验             |
| src/styles          | 样式入口和有序分区                    |
| articles            | 当前研究文章与新闻                    |
| content/site        | 正式 catalog.json                     |
| public              | 对外提供的品牌、配图和产品 PNG        |
| scripts / tests     | 构建与内容工具、自动化测试            |
| docs                | 架构和设计说明                        |
| parked-pages        | 下线页面内容与恢复说明                |
| posts               | 历史文章迁移输入                      |

## 常用修改入口

- 首页文案与产品顺序：src/data/page-content.ts。
- 首页布局：src/site/pages/home.tsx。
- 导航：src/data/research-navigation.ts、src/site/components/navigation.tsx。
- 页脚：src/data/site.ts、src/site/components/footer.tsx。
- 有效路由：src/site/routing/routes.tsx。
- 样式：src/styles/apple-system.css 只负责按顺序导入分区。

详细说明见 [项目结构](docs/architecture/project-structure.md)，设计与内容要求见 [发布规范](docs/openai-inspired-layout-notes.md)。
