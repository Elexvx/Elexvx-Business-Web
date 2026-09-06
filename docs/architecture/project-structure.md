# 项目结构与维护

## 运行边界

src/app 只保留 Next.js 入口。src/site/NextSitePage.tsx 在服务端加载内容，App.tsx 组合状态并选择页面。页面实现按 home、research、projects、publications、company 分组，shared 放共用卡片和空状态，index 仅导出。

components 中 navigation、footer、shell、ui 分别负责导航、页脚、页面外壳和基础组件。providers 存语言、主题、内容状态。客户端组件不直接读取磁盘。

## 内容与路由

articles 和 content/site/catalog.json 经内容解析、展示配置进入 routing/routes.tsx，形成有效页面清单。顶部、底部和搜索使用同一个 navigation-availability.ts 判断链接是否可显示。研究方向还需有已发布文章。

栏目顺序和名称仍由配置维护；这不是扫描任意文件自动推断栏目。新增页面需要同时提供 Next 路由和站点路由记录。

下线内容存入 parked-pages，并移出正式 catalog；已有产品引用的分类标识保留在 retiredResearchDirectionSlugs。恢复按照各目录 README 操作，同时处理英文地址的 404 占位。

## 样式顺序

apple-system.css 是唯一导入入口。sections/01 到 15 依次为基础、首页编辑布局、门户组件、门户外观、媒体卡片、页面入口、首页布局、新闻、活动、主题、导航布局、Cookie、研究索引、内容细节和导航半透明背景。

此次拆分保留原始 CSS 顺序，以避免视觉回归。部分历史覆盖仍在后段，修改时检查同名选择器，不能随意重排导入。新增规则写入对应分区。

页面配色统一使用主题变量：正文与标题使用 --color-ink，辅助文字使用 --color-ink-muted，背景使用 --color-canvas / --color-parchment，边框使用 --color-hairline，主按钮使用 --color-button-*。默认深色值在 01-foundation.css，浅色值在 10-theme.css。不要为单独页面写死黑白颜色；图片遮罩上的文字和品牌黑白展示可保留固定配色。

## 历史和资源

archive/astro 保存旧 Astro 源码和配置，不参与现行 TypeScript、Lint 或构建。posts 保留为迁移脚本输入，articles 是现行内容。Vite、src/main.tsx、src/ssg 保留为兼容工具，主开发入口是 Next.js。

public/brand 放品牌，public/visuals 放配图，public/products 放正式 PNG。旧封面源码在 archive/design/product-covers。不要将内部草稿放进 public。保持历史静态 URL，避免文章引用失效。

## 团队维护

团队资料集中在 src/data/team.ts，照片在 public/team。保留原站人物 ID，列表与中英文详情路由由同一份资料生成；新增成员后需构建静态页面。列表桌面三列，照片固定正方形；简介保留完整段落，不设置固定高度或省略行数。样式位于 sections/16-team.css。原始介绍迁自 archive/astro/data/leaders.ts，职务和履历更新请直接核对并修改现行数据。

## 验证

结构修改运行 npm run check，再检查首页、研究列表、详情页和下线地址。本地验证不代表线上已部署。
