# Elexvx Research 文章库

这里是独立维护的文章目录。文章内容不和页面组件、公司资料或站点路由混在一起；保存后由静态构建自动生成列表、详情页、RSS 和 sitemap。

## 目录

- `insights/`：研究文章与技术记录
- `news/`：公司公告、业务动态与从旧站迁移的新闻
- `assets/`：文章需要的原始图片或附件（发布前请将可公开素材同步到 `public/visuals/`）

## 发布状态

- `draft`：草稿，不生成公开文章页
- `published`：公开发布；研究文章必须有至少一条 `verified: true` 的证据，新闻文章必须保留可核验的 `sourceUrl`
- `archived`：保留在内容库中，但不进入公开文章列表

旧站文章已经迁移到 `news/`，正文仅清理了旧 HTML 排版、图片路径和缩进，事实内容保持原文。旧路径会跳转到新的 `/news/` 详情页。

## 新建研究文章

```bash
npm run content:new -- --slug new-insight --title "文章标题"
```

研究文章 frontmatter 至少包含 `slug`、`title`、`excerpt`、`publishedAt`、`author`、`status` 和 `evidence`。封面图片使用 `cover` 字段引用站点公开路径，例如：

```yaml
cover: '/visuals/ai-data-gradient.jpg'
```

没有事实依据的数字、客户、荣誉和效果只能留在草稿或明确占位中。

新增“最新动态”时，直接在 `news/` 新建 Markdown 文件，沿用现有字段：`slug`、`title`、`excerpt`、`publishedAt`、`author`、`category`、`tags`、`status`、`cover` 和 `sourceUrl`。保存后构建会自动生成 `/news/` 列表、详情页、RSS 和 sitemap。
