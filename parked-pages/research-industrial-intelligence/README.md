# 工业智能与安全页面暂存

暂时移除日期：2026-09-05。原路径：`/research/industrial-intelligence/` 与 `/en/research/industrial-intelligence/`。

- direction.json：页面专属内容，已从正式 researchDirections 移出。
- industrial-intelligence-gradient.jpg：配图备份，原图仍由共享页面配置引用。
- navigation-entries.txt：移除的导航与页脚入口。
- 共享 ResearchDirectionPage 模板保留。相关产品和已发布文章继续保留。
- catalog 的 retiredResearchDirectionSlugs 保留分类标识，以便现有产品引用通过校验；不会生成页面。

恢复：把 direction.json 放回 catalog 的 researchDirections，从 retiredResearchDirectionSlugs 移除 industrial-intelligence，恢复导航，并删除 src/app/en/research/industrial-intelligence/page.tsx 的 404 占位。
