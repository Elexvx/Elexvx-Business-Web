# 研究与活动分类

研究内容存放于 `content/site/research.json`，活动内容存放于 `content/site/activities.json`。两类内容独立维护，详情页共用文章排版。只有 published 状态的内容参与展示。

每篇文章的 category 为显示名称，categorySlug 为稳定的分类标识。同一分类使用相同标识和名称。分类从已发布文章中自动汇总，列表与顶部菜单同步更新。

分类链接使用 `/research?category=ai-safety` 或 `/activities?category=roadshows`。分类不生成独立页面，直接在对应列表筛选；切换分类更新 URL，刷新和浏览器前进后退保留筛选。无 category 参数显示全部，未知分类显示空结果。

当前每个栏目各有三篇明确标注的示例文章，用于预览布局与筛选，可在真实内容准备好后删除。研究示例不是已完成研究成果，活动示例不是已举办活动。

研究论文正文使用 `$...$` 表示行内 LaTeX，使用语言为 `math` 的代码围栏表示独立公式；由 KaTeX 输出 HTML 与 MathML。图表标题采用“图1 标题”或“表1 标题”的独立段落，自动使用图表说明样式。网页版本已移除参考文献与附录，Word 下载文件保留原始内容。不要直接重新运行初始 DOCX 导入覆盖已整理的 LaTeX 与章节。
