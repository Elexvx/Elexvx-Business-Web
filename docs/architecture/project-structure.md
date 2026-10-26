# 项目结构与维护

## 运行边界

src/app 只保留 Next.js 入口。src/site/NextSitePage.tsx 在服务端加载内容，App.tsx 组合状态并选择页面。页面实现按 home、research、projects、publications、company 分组，shared 放共用卡片和空状态，index 仅导出。

components 中 navigation、footer、shell、ui 分别负责导航、页脚、页面外壳和基础组件。providers 存语言、主题、内容状态。客户端组件不直接读取磁盘。

## 内容与路由

articles 和 content/site/catalog.json 经内容解析、展示配置进入 routing/routes.tsx，形成有效页面清单。顶部、底部和搜索使用同一个 navigation-availability.ts 判断链接是否可显示。正式 catalog 中的研究方向只要生成路由就会显示，不要求先发布文章。

栏目顺序和名称仍由配置维护；这不是扫描任意文件自动推断栏目。新增页面需要同时提供 Next 路由和站点路由记录。

parked-pages 保存下线时的路由快照、原始资料和恢复记录，供后续核对；具体状态以各目录 README 为准。AI 与数据智能、工业智能与安全方向已恢复，当前路由清单包含这两个路径，英文页面由共享动态路由生成。历史恢复步骤已执行，后续维护时无需重复导入归档资料或删除逐页英文占位。其他仍下线且被项目引用的方向，可在 retiredResearchDirectionSlugs 保留分类标识而不生成页面。

## 样式顺序

apple-system.css 是唯一导入入口；当前 sections 编号为 01–28。各分区名称和加载顺序以该文件中的 import 列表为准，修改时保持顺序并检查后置覆盖。

此次拆分保留原始 CSS 顺序，以避免视觉回归。部分历史覆盖仍在后段，修改时检查同名选择器，不能随意重排导入。新增规则写入对应分区。

页面配色统一使用主题变量：正文与标题使用 --color-ink，辅助文字使用 --color-ink-muted，背景使用 --color-canvas / --color-parchment，边框使用 --color-hairline，主按钮使用 --color-button-\*。默认深色值在 01-foundation.css，浅色值在 10-theme.css。不要为单独页面写死黑白颜色；图片遮罩上的文字和品牌黑白展示可保留固定配色。

## 历史和资源

旧 Astro 站点源码和配置已删除，历史版本可通过 Git 历史查看。posts 保留为迁移脚本输入，articles 是现行内容。主开发和构建入口是 Next.js；Vite 兼容链仍可手动运行，入口为 index.html → src/main.tsx，配置见 vite.config.ts。src/ssg/document.tsx 当前没有应用或构建调用点，只列入 lint 和 TypeScript 检查；作为历史实现留待核对，不据此直接删除。

public/brand 放品牌，public/visuals 放配图，public/products 放正式 PNG。旧封面源码可通过 Git 历史查看。不要将内部草稿放进 public。保持历史静态 URL，避免文章引用失效。

## 团队维护

团队资料集中在 src/data/team.ts，照片在 public/team。保留原站人物 ID，列表与中英文详情路由由同一份资料生成；新增成员后需构建静态页面。列表桌面三列，照片固定正方形；简介保留完整段落，不设置固定高度或省略行数。样式位于 sections/16-team.css。原始介绍已从旧站迁入，职务和履历更新请直接核对并修改现行数据。

## 验证

结构修改运行 npm run check，再检查首页、研究列表、详情页和下线地址。本地验证不代表线上已部署。
