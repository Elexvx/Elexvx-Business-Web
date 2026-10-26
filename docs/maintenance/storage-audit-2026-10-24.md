# 项目存储整理记录（2026-10-24）

本次整理只处理可再生缓存、空目录、内部设计资料和过时说明。没有删除文章、研究原件、资质证明、工作树源码或当前页面使用的资源，没有提交、推送或部署。

## 已清理的可再生内容

清理前以 `du -sk` 逐项记录占用，共 5,741,944 KiB，约 5.48 GiB。这是移除目录的文件系统占用统计，不等同于 APFS 实际空闲空间增量。

| 路径                                                           |    清理前占用 | 内容                           |
| -------------------------------------------------------------- | ------------: | ------------------------------ |
| `.next/cache`                                                  |   384,164 KiB | 主目录旧 Next 构建缓存         |
| `dist-dev/dev/cache`                                           |   439,976 KiB | 主目录开发缓存                 |
| `.claude/worktrees/project-overview-3c1869/.next/cache`        |   853,972 KiB | 历史工作树构建缓存             |
| `.claude/worktrees/project-overview-3c1869/dist-dev/dev/cache` | 3,983,468 KiB | 历史工作树开发缓存             |
| `.vercel/output`                                               |    80,364 KiB | 可重新生成的旧 Vercel 构建输出 |

清理前确认这些路径没有 Git 跟踪文件，也没有被进程打开。两个历史工作树的暂存、未暂存和未跟踪文件状态在清理前后完全一致。工作树本身、依赖、配置和非缓存构建文件保留；其中 `project-overview-3c1869` 有大量未提交修改，不能当作垃圾目录删除。

另移除了没有文件的 `api/wechat/`、`api/`、`server/`、`posts/technology/`、`posts/stories/`。实际接口实现仍在 `src/server/`。

原始尺寸及清理摘要保存在本地忽略目录 `.local/maintenance/2026-10-24/storage-cleanup.json`。构建会再生成缓存，目录大小可能随后续开发增长。

## 已归位的设计资料

| 原路径                                                  | 新路径                                              |
| ------------------------------------------------------- | --------------------------------------------------- |
| 根目录 `design-qa.md`                                   | `docs/qa/footer-2026-10-23.md`                      |
| `public/visuals/footer/prompt.md`                       | `docs/brand/footer/initial-prompt.md`               |
| `public/visuals/footer/riders-prompt.md`                | `docs/brand/footer/riders-prompt.md`                |
| `public/visuals/footer/footer-knowledge-landscape.webp` | `docs/brand/footer/footer-knowledge-landscape.webp` |

当前页脚仍使用 `public/visuals/footer/footer-knowledge-landscape-riders.webp`，运行路径没有变。旧版图与生成记录保留为内部参考，避免继续作为公开静态文件分发。新构建的 `dist/visuals/footer/` 只包含正在使用的 riders 图片。

新增共享忽略规则，防止 `.claude/worktrees/` 被误提交；Vercel 上传忽略 `.claude/`、`.local/`；格式化忽略本地工作树、缓存和部署输出。保留 `.vercel` 的项目配置及 `.local` 中已有验收证据。

## 发现但保留的候选项

以下均没有因为“搜索不到直接引用”就删除。资源可能通过图片清单、动态组件、下载链接或历史静态 URL 被使用。

| 候选                                                                 | 发现                                                                       | 本次处理                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| 四篇论文目录的部分 `rId*.png`                                        | 28 份跨目录同内容副本，约 8.7 MB；正文主要使用 `image1–7` 或另一篇论文的图 | 保留，删除前需核对原件与历史链接并同步图片清单 |
| `public/visuals/news/test.png`                                       | 约 0.99 MB，未见正文引用，但清单保留三个优化变体                           | 保留，列为测试图候选                           |
| `public/optimized/`                                                  | 有约 2.2 MB 同内容变体，清单仍按不同名字引用                               | 保留，不能直接按哈希删除                       |
| `public/brand/` 部分别名 SVG                                         | 存在同内容文件；`original/` 是品牌源文件                                   | 保留品牌源文件和历史地址                       |
| `public/images/post/doc/20250717/01.PNG`、`02.jpg`                   | 约 20 MB，仓库内未见引用                                                   | 保留，可能是历史文章直链附件                   |
| `public/team/` 部分备用人像                                          | 约 13.5 MB 未被当前团队配置选中                                            | 保留，属于可供更换的原始素材                   |
| `src/ssg/document.tsx`                                               | 没有现行应用或构建调用点，只纳入检查                                       | 标为历史待核对，未删除兼容链                   |
| `scripts/create-post.mjs`、`scripts/imports/import-research-docx.py` | 旧格式写入或一次性导入工具，无 npm 调用点                                  | 保留，迁移输入及本机导入流程还需核对           |

`articles/` 是现行内容；`posts/latest-news/` 是迁移脚本输入；`parked-pages/` 保留路由快照、原始资料与恢复依据。`src/data/image-manifest.json` 登记源图与优化变体，`SiteImage` 会动态选择资源，因此直接文本搜索并不能完整判断素材是否无用。资质证书、论文 DOCX、研究资料与站点验证文件都保留。

已修正项目结构说明和两个研究归档 README：研究页面已恢复，原归档用于追溯，不应再次执行旧恢复步骤。Vite 手动兼容入口仍在，主开发和发布入口是 Next.js。

## 验证与限制

- 通过：TypeScript、全站 Lint、内容检查、77 项既有测试、完整生产构建、80 个英文页面本地化检查。
- `npm run check` 在格式阶段停止：以下 12 个文件存在格式问题。逐项对 `git show HEAD:<路径>` 执行相同 Prettier 检查，均在当前 HEAD 中已经失败；本次没有批量改动这些文件。其后内容、测试和构建单独执行并通过。
- 本次文档与忽略规则检查了路径、链接和 diff；没有进行页面视觉验收，既有页脚视觉验收状态仍见归档记录。
- 完整格式门禁并非全绿，未提交、推送或部署。

原有格式问题文件：

```text
src/app/company/design/page.tsx
src/site/components/article-gallery.tsx
src/site/pages/qualifications.tsx
src/site/providers/theme-provider.tsx
src/data/image-manifest.json
src/data/qualifications.ts
src/data/team.ts
src/styles/sections/06-page-entry.css
src/styles/sections/16-team.css
src/styles/sections/17-company.css
src/styles/sections/20-page-width.css
scripts/sync-design.mjs
```

逐项基线核对保存在 `.local/maintenance/2026-10-24/format-baseline.json`。
