# AI 与数据智能页面暂存

状态更新（2026-10-04）：此方向已根据原始 `direction.json` 恢复。当前路由清单包含 `/research/ai-data`，英文页面通过 `src/app/en/[...path]/page.tsx` 共享路由生成。此目录保存恢复前的资料和 2026-09-05 下线记录，供核对与追溯，不参与当前路由生成。

暂时移除日期：2026-09-05。原路径：`/research/ai-data/` 与 `/en/research/ai-data/`。

- `direction.json`：恢复前的页面专属标题、摘要、方法和配图资料；正式页面已恢复，归档副本供核对。
- `ai-data-gradient.jpg`：配图备份；正式 public 中的同图仍由首页活动配置共用，因此保留。
- `navigation-entries.txt`：移除的导航入口及旧路径映射。
- 页面使用共享的 `src/site/pages/` 中 `ResearchDirectionPage` 模板；其他研究方向继续使用，故不移动共享代码。
- 已发布文章继续保留，此文件夹不参与站点路由生成。

历史恢复步骤已完成。维护时以正式 catalog、导航配置和当前路由清单为准；无需再次复制归档资料或调整英文逐页占位文件。
