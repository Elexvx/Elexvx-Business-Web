# UI 组件与主题

交互组件使用 radix-ui（Radix Primitives），视觉使用现有 CSS 主题变量，不引入 Radix Themes 默认样式。

- src/site/components/primitives/select.tsx：统一选择器，职位筛选使用，支持键盘、焦点返回与 Portal 定位。
- 研究筛选使用 Radix Popover，复用原有列表排版。
- 页脚主题切换、Cookie 偏好：Radix Switch。
- src/site/components/primitives/modal.tsx：共享 ModalContent，基于 Radix Dialog 的 Portal、Overlay 和 Content，统一焦点恢复、背景交互隔离与滚动锁定。移动导航、Cookie 设置与文章分享复用此组件。
- 公共样式：src/styles/sections/19-primitives.css。Portal 默认挂载于 body，必须使用 html 定义的主题变量；移动导航将 Portal 挂载于原有 shell 内，以保留导航的局部样式。

antd 组件依赖与 ConfigProvider 已移除，旧主题文件可通过 Git 历史查看。@ant-design/icons 目前仅作为图标包使用。顶部悬停导航仍保留现有延时与动画实现，未在此次接入中重写。

新增交互优先复用 Radix 并封装到 primitives；普通链接、文本输入及按钮保留原生语义。检查键盘打开、方向键选择、Escape 关闭与焦点返回，以及浅深主题和窄屏显示。

## 弹层与键盘

ModalContent 应放在受控的 Dialog.Root 中，并提供 Dialog.Title 和 Dialog.Description；没有描述时显式传入 aria-describedby={undefined}。多个打开按钮或通过事件打开弹窗时，可传 returnFocusRef 指定关闭后返回的控件。不要额外添加 document 级 Tab 拦截、手动 inert 或 body 滚动锁，以免和 Radix 冲突。

移动导航在切换到桌面断点（901px 起）时自动关闭。桌面菜单保留悬停延时，同时支持方向下键进入菜单、Escape 返回触发项，以及焦点离开导航后收起。全站搜索支持方向键浏览结果；输入搜索时先用 Escape 清空查询，再按 Escape 关闭导航。加载失败可在原处重试。

文章图片预览继续使用原生 dialog 的 top layer，保留切图动画、水印和缩略图；左右方向键、Home/End 和横向滑动均可切换图片，纵向手势不切图。文章分享的异步卡片生成需校验请求版本，避免关闭或切换方式后出现过期状态。

## 加载与反馈

服务状态使用与真实面板结构一致的骨架屏，装饰内容对读屏隐藏，加载提示使用 role="status"。正常状态更新采用礼貌播报；错误提示与密码输入通过 aria-describedby 关联。骨架动画尊重 prefers-reduced-motion。沿用现有 CSS 主题，不额外引入 Tailwind 或第二套主题变量。
