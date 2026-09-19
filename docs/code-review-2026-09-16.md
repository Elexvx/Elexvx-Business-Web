# 代码审查报告 · Elexvx Research Web

- 审查时间：2026-09-16
- 审查范围：`src/`（Next.js 16 静态导出站点）、`api/` + `server/`（微信 JSSDK 签名服务）、`scripts/`（构建与生成脚本）、`tests/`
- 基线验证：`npm run typecheck` ✅、`npm run lint` ✅、`npm test` ✅（33 passed / 8 files）、`npm run build` ✅（17s，51 路由、164 个 HTML 产物）

---

## 总体评价

工程质量**高于平均水平**：类型检查/ESLint/单元测试/内容校验/英文校验全部纳入 `npm run check`，且全部通过；frontmatter 解析层做了 fail-fast 校验并带文件名上下文；Markdown 采用自研 AST → React 渲染（而非 `dangerouslySetInnerHTML` 灌正文），`safeHref` 白名单拦住了 `javascript:` / `data:`；密钥不入库、`.env` 已忽略。

主要问题集中在**产物体积**和**构建期 I/O 放大**两处，另有若干配置漂移与部署待验证项。以下按严重度排列。

---

## P0 · 高优先级

### 1. 英文页面体积失控：整本 467KB 词典被打进每一页

**证据**

| 页面 | 体积 | RSC flight 负载 |
|---|---|---|
| `dist/index.html`（中文） | 204 KB | 69 KB |
| `dist/en/index.html` | **755 KB** | **449 KB** |
| `dist/contact/index.html` | 126 KB | 56 KB |
| `dist/en/contact/index.html` | **631 KB** | **411 KB** |
| `dist/en/research/memory-centric-inference/index.html` | **834 KB** | — |

`content/i18n/en.json` = 467 KB / 2379 条；每个英文页都完整内联了它（在 flight 数据中可直接看到 `"容量压力、版本一致性和迁移抖动":"Capacity pressure, ..."` 这类条目）。

**根因**：`App` 把整本词典作为 prop 传给了被标记为 `'use client'` 的 `LanguageProvider`，于是词典被序列化进每个英文页面的 RSC payload。

- `src/site/App.tsx:23` — `translations={locale === 'en' ? english : undefined}`
- `src/site/providers/i18n.tsx:1`（`'use client'`）、`:28`
- `src/site/translation.ts:4` — `{ ...existingEnglish, ...contentEnglish }`

**影响**：英文页 LCP/TTFB 与流量开销是中文页的 5–6 倍，移动端尤其明显。

**建议**（任选其一，推荐第一条）：
1. **构建期完成翻译**：`t()` 是纯查表，英文页本就是预渲染的，可在服务端渲染阶段完成翻译，使词典完全不进客户端。`MarkdownRenderer` 目前依赖 `useI18n()`，需要把 `t` 提升为服务端传入的 props。
2. **按路由裁剪词典**：构建时扫描该路由实际出现的文案，只下发所需子集（2379 → 通常几十条）。
3. **改为按需加载**：词典拆成独立 JSON chunk，客户端 `import()` 后注入 context（会引入一次额外请求与闪烁，需配 skeleton）。

---

### 2. 构建期内容加载重复且无缓存，呈 O(N²) 放大

`loadInsights()` / `loadNews()` 每次调用都 `readdirSync` + 逐文件 `readFileSync` + 解析 frontmatter，**没有任何 memo**（`src/content/loader.ts:10`、`src/content/news-loader.ts:8`）。

单个页面的渲染链路上它被调用 **6–8 次**：

- `src/app/layout.tsx:107-108` ×2
- `src/site/NextSitePage.tsx:10-11` ×2
- `src/site/App.tsx:21`（`resolveRoute` → `allRoutes()` 重建全表）、`:27`（`getStaticRoutes()` 再建一次）
- `src/site/routing/metadata.ts:8` ×2（generateMetadata）
- `src/app/en/[[...path]]/page.tsx:13,26` ×2（generateStaticParams + 渲染）

叠加 51 路由 × 中英双语，实际是 O(页面数 × 文章数) 的磁盘 I/O。当前仅 12 篇 Markdown、构建 17s 尚可接受，内容增长后会明显劣化。

**建议**
- 模块级缓存（`let cached: Insight[] | undefined`）或 React `cache()` 包裹 loader。
- `resolveRoute()`（`src/site/routing/routes.tsx:285`）用 `Map<string, SiteRoute>` 索引替代 `Array.find` 线性扫描；`allRoutes()` 不要在每次调用时重建数组。

---

### 3. 微信签名服务：部署形态待验证 + 缺限流 + 配置无文档

**3.1 部署形态风险（需实测确认）**
`api/wechat/signature.ts` 位于 Next.js App Router 之外，且 `next.config.mjs:9` 设了 `pageExtensions: ['tsx']`，所以 `next build` 完全忽略它。而 `vercel.json` 设了 `"framework": null` + `outputDirectory: dist`，同时又声明了：

```json
"functions": { "api/wechat/signature.ts": { "maxDuration": 30 } }
```

在 `framework: null` 下，Vercel 是否仍会把根目录 `/api` 编译为 Serverless Function **必须实测确认**。若未部署，客户端 `configureWechat()` 会静默失败（`src/site/components/wechat-share-init.tsx:13` 空 catch），表现为"微信里分享卡片不生效"但无任何报错——很难排查。

**建议**：上线前用 `curl https://www.elexvx.com/api/wechat/signature?url=https://www.elexvx.com/` 实测；同时在前端把失败降级为"使用默认分享卡片"而非完全静默。

**3.2 允许的 origin 两处不一致**
- `api/wechat/signature.ts:19` — 硬编码 `['https://www.elexvx.com']`
- `scripts/wechat-share-server.ts:6` — 读 `WECHAT_ALLOWED_ORIGINS` 环境变量

**建议**：统一走环境变量，并在启动时集中校验（fail-fast）。

**3.3 无限流，Serverless 多实例会放大上游调用**
`provider` 是**模块级**变量（`api/wechat/signature.ts:3`），只在单实例内缓存。Serverless 并发/冷启动会产生多个实例，每个实例各自去微信 `stable_token` 接口取票，容易触及接口配额。

**建议**：加一层共享缓存（Vercel KV / Edge Config），或在 CDN 层对该响应做短 TTL 缓存；至少加基于 IP 的限流。

**3.4 缺少 `.env.example`**
`WECHAT_APP_ID`、`WECHAT_APP_SECRET`、`WECHAT_ALLOWED_ORIGINS`、`NEXT_PUBLIC_WECHAT_SIGNATURE_URL`、`WECHAT_SHARE_PORT` 五个变量无文档、无启动校验。两处读取方式也不一致：server 脚本启动即 fail-fast（好），API handler 是运行时返回 503（可观测性差）。

---

## P1 · 中优先级

### 4. 客户端派生数据每次渲染重建，击穿 memo
`src/site/providers/content-context.tsx:33-41`：`usePublishedInsights()`、`useNews()`、`useAvailableLink()` 在 render 内直接 `.filter()` / `createLinkAvailability()`，无 `useMemo`，每次返回**新数组/新对象**，会让下游所有 `React.memo` 失效。

**建议**：`useMemo` 包裹，或在 provider 里预先算好并缓存。

### 5. `ContentProvider` 把全量正文跨客户端边界序列化
`layout.tsx:116` 把所有 insight/news（**含完整 markdown 正文 `body`**）传入 `'use client'` 的 `ContentProvider`，即使当前页只需要一条。叠加问题 1，是产物体积的第二大来源。

**建议**：只传当前路由所需条目，或只传摘要（title/excerpt/slug/cover），详情页单独注入正文。

### 6. 旧路径重定向：Next 版本把 meta refresh 放在 `<body>` 里
- `src/app/[...legacy]/page.tsx:26` — `<meta httpEquiv="refresh">` 位于 `<main>` 内，属非规范 HTML，部分浏览器/爬虫不处理。
- `scripts/generate-site.tsx:39` — 同一份逻辑放在 `<head>`，写法正确。

**建议**：统一由 `generate-site.tsx` 生成重定向页，删掉 `[...legacy]` 页面版本；或改由宿主层做 301（Vercel `redirects` 已覆盖大部分）。

### 7. `vercel.json` 与 `routes.tsx` 重定向表漂移（已造成实际缺失）
- `vercel.json:49` — `/blog → /research`
- `src/site/routing/routes.tsx:168` — `/blog → /insights`

而 `/insights` 在 `src/data/disabled-sections.ts:2` 中被禁用，`redirectRoutes` 会过滤掉目标被禁用的条目（`routes.tsx:191`）→ **静态产物里 `dist/blog/` 根本不存在**。也就是说：在 Vercel 上靠 `vercel.json` 能跳，换任何别的宿主 `/blog` 就 404。
另：`/service/ai-design → /research` 只存在于 `vercel.json`，`routes.tsx` 中没有。

**建议**：把重定向表收敛为单一数据源（如 `src/data/redirects.ts`），用脚本生成 `vercel.json` 的 `redirects` 段与静态兜底页，并加一条测试断言两边一致。

### 8. Cookie 同意状态没有消费者
`cookie-consent.tsx` 认真实现了偏好存储（`elexvx-cookie-preferences-v1`），但全库 `grep gtag|analytics|googletagmanager|hm.js` 无任何第三方统计/营销脚本——即"收集了同意但无人使用"。未来接入统计前必须先补 gate 逻辑，否则合规上站不住。

另外无障碍：`role="dialog"`（`cookie-consent.tsx:69`）缺 `aria-modal`、焦点陷阱、Esc 关闭。

### 9. 产物双写导致 HTML 数量翻倍
`scripts/generate-site.tsx:49-56` 同时写 `path/index.html` 与 `path.html`，164 个 HTML 中约一半是副本。已确认 canonical 覆盖正常（`dist/index.html`、`dist/contact/index.html` 均有 `rel="canonical"`），所以 SEO 风险可控，但建议按宿主的实际 URL 规则只保留一种，减少产物体积与发布时长。

---

## P2 · 低优先级 / 改进项

10. **日志非结构化**：`server/wechat-signature.ts:34` 用 `console.warn` 且无 requestId，不利于线上排障。建议统一结构化 JSON 日志。
11. **`access_token` 出现在 URL query**（`server/wechat-signature.ts:38`）：这是微信官方接口要求，但需确认宿主访问日志不会记录完整 URL。
12. **dev/prod 首页渲染路径不一致**：`src/app/page.tsx:15` 无条件注入 `homeHtml`，而 `NextSitePage.tsx:13` 用 `NODE_ENV === 'production'` 判断 → dev 下中文首页走静态 HTML、英文首页走 React 渲染，调试时容易困惑。建议统一条件。
13. **自动主题 60s 轮询**：`theme-provider.tsx:97` 常驻 `setInterval`，移动端后台耗电。建议改为 `visibilitychange` + 日出日落时刻精确调度。
14. **测试覆盖缺口**（33 个测试全绿，但）：
    - 无 `api/wechat/signature.ts` 的 HTTP 层测试（只测了 `server/wechat-signature.ts` 的纯函数）
    - 无路由表/重定向一致性测试（正好能拦住第 7 条）
    - 无 `generate-site` 产物断言（sitemap/rss/重定向页）
    - i18n 一致性依赖 `scripts/check-english.ts` 而非单测
15. **`shell.tsx` 的 `mainHtml`**：已注明"trusted, build-generated"，来源可信；建议再加一条构建期断言确保它只来自 `home-static.json`，避免未来有人传入用户数据。

---

## 做得好的地方（保持）

- **Markdown 渲染安全**：自研 parser 产出 AST 交给 React 渲染，仅 KaTeX 用 `dangerouslySetInnerHTML` 且 `trust: false`（`MarkdownRenderer.tsx:21,132`）；`safeHref` 白名单拦截危险协议（`markdown.ts:16`）。
- **内容校验 fail-fast**：`frontmatter.ts` 的 `asString` / `asStringArray` / `asEvidenceArray` 校验带文件名与字段上下文；`loader.ts:19-26` 还会拦截重复 slug 与"已发布但证据未核验"。
- **构建门禁完整**：`npm run check` 串起 typecheck / lint / format / content-check / test / build。
- **微信签名不泄露凭据**：`wechat-share-server.ts:37` 明确注释并实践了"不向客户端或日志暴露 token/凭据/上游响应体"。
- **URL 校验**：`validateShareUrl`（`server/wechat-signature.ts:3`）限制长度、强制 https、校验 origin 白名单。
- **密钥管理**：`.env*` 已全部 gitignore，仓库内无真实密钥。

---

## 建议的修复顺序

1. 问题 1（英文页词典内联）——收益最大，直接改善全站英文页体验
2. 问题 3.1（实测签名接口是否真的部署）+ 3.4（补 `.env.example` 与启动校验）
3. 问题 2（loader 缓存 + 路由索引）
4. 问题 7（重定向单一数据源）+ 补对应测试
5. 问题 4、5、6（客户端 memo、正文按需注入、重定向页统一）
6. 其余 P2 项按迭代节奏处理
