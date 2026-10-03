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

ESA Pages 项目 `elexvx-public-pages` 连接本仓库的 `main` 分支，使用 Node.js 24 自动构建并发布。`esa.jsonc` 固定依赖安装、构建命令和 `dist` 静态产物目录；没有配置 SPA 回退，缺失页面返回真实 404。

`elexvx-site-router` 是同一仓库的第二个 ESA 应用，构建根目录为 `esa/router`，函数入口为 `./dist/index.js`。它负责域名和旧网址跳转、状态数据接口，以及新版文章的 IndexNow 通知；页面和资源从绑定到静态 Pages 的 `assets.elexvx.com` 读取。网站内容保持静态发布，未新增用户账号系统。

函数生产变量 `UPTIMEROBOT_API_KEY` 应使用加密存储。`INDEXNOW_KV_NAMESPACE=elexvx_indexnow` 指定 ESA KV 回执空间；构建生成的 `indexnow-manifest.json` 在内容变化后更新版本，成功页面访问会异步提交文章和集合 URL，成功回执避免重复提交。可选的 `CRON_SECRET` 仅用于保护手动通知接口，不需要 Vercel Cron。提交成功不等于搜索引擎实际收录。

2026-10-03 迁移进度：两套 ESA Git 构建均已发布，路由函数暂绑定 `esa-migration-preview.elexvx.com`，已通过完整页面/资源及境内海外探针检查。正式域名仍使用原有公开页面路由；状态密钥和旧 DNS 记录替换尚待完成，因此 Vercel 运行服务尚未停用。Vercel 已配置 `exit 0` 跳过后续 Git 构建。正式切换后需停用旧的公开页面分段路由，再验证接口和全部域名，最后暂停 Vercel 项目与定时任务。邮箱、`bp`、`docs`、`acc` 属于其他业务入口，应保留。

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
| archive             | 旧 Astro 源码、旧设计，不参与现行构建 |
| posts               | 历史文章迁移输入                      |

## 常用修改入口

- 首页文案与产品顺序：src/data/page-content.ts。
- 首页布局：src/site/pages/home.tsx。
- 导航：src/data/research-navigation.ts、src/site/components/navigation.tsx。
- 页脚：src/data/site.ts、src/site/components/footer.tsx。
- 有效路由：src/site/routing/routes.tsx。
- 样式：src/styles/apple-system.css 只负责按顺序导入分区。

详细说明见 [项目结构](docs/architecture/project-structure.md)，设计与内容要求见 [发布规范](docs/openai-inspired-layout-notes.md)。
