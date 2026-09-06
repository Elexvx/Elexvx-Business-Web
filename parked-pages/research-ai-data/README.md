# AI 与数据智能页面暂存

暂时移除日期：2026-09-05。原路径：`/research/ai-data/` 与 `/en/research/ai-data/`。

- `direction.json`：页面专属标题、摘要、方法和配图信息，已从正式 catalog 移出。
- `ai-data-gradient.jpg`：配图备份；正式 public 中的同图仍由首页活动配置共用，因此保留。
- `navigation-entries.txt`：移除的导航入口及旧路径映射。
- 页面使用共享的 `src/site/pages/` 中 `ResearchDirectionPage` 模板；其他研究方向继续使用，故不移动共享代码。
- 已发布文章继续保留，此文件夹不参与站点路由生成。

恢复时将 direction.json 对象放回 content/site/catalog.json 的 researchDirections 数组首位，恢复所需导航与页脚入口。路由会随 catalog 自动生成。旧路径映射可按 navigation-entries.txt 恢复。

英文地址保留 src/app/en/research/ai-data/page.tsx 的 notFound 占位，避免开发环境静态导出 catch-all 报错；恢复时删除该占位文件。
