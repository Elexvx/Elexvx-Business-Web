# UI 组件与主题

交互组件使用 radix-ui（Radix Primitives），视觉使用现有 CSS 主题变量，不引入 Radix Themes 默认样式。

- src/site/components/primitives/select.tsx：统一选择器，职位筛选使用，支持键盘、焦点返回与 Portal 定位。
- 研究与活动：Radix Tabs 与 Popover，复用原有列表排版。
- 页脚主题切换、Cookie 偏好：Radix Switch。
- 公共样式：src/styles/sections/19-primitives.css。Portal 挂载于 body，必须使用 html 定义的主题变量，不能依赖页面父级配色。

antd 组件依赖与 ConfigProvider 已移除，旧主题文件保存于 archive/design/antd-theme.ts。@ant-design/icons 目前仅作为图标包使用。顶部悬停导航仍保留现有延时与动画实现，未在此次接入中重写。

新增交互优先复用 Radix 并封装到 primitives；普通链接、文本输入及按钮保留原生语义。检查键盘打开、方向键选择、Escape 关闭与焦点返回，以及浅深主题和窄屏显示。
