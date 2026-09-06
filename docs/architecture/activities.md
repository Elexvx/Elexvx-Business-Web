# 活动栏目

活动与研究独立，地址 /activities。内容集中在 content/site/activities.json，使用数组保存活动。每项包含 slug（唯一 URL 标识）、title、excerpt、publishedAt（YYYY-MM-DD）、author、status（draft 或 published）、body（Markdown），可选 category、cover。正文支持多段落、标题、图片和长文本。

只有 published 项进入列表、搜索和详情页静态路由；英文路径由统一路由生成。新增或发布活动后重新构建。不要把活动放入研究文章目录。

首篇活动为 2026 年 9 月 3 日锦兮创见路演回顾，内容依据用户提供的会议纪要整理，封面为站内示意配图。没有已发布活动时，列表显示空状态。静态导出要求动态路由至少生成一个参数，因此空内容时使用 _empty 占位并渲染 404；该路径不进入导航或 sitemap。
