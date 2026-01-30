# 宏翔商道企业网站 v1.0

企业级网站解决方案，专为现代企业打造的高性能、响应式网站模板。

## 🚀 核心特性

- ✅ **生产就绪** - 在 PageSpeed Insights 中获得优异性能评分
- ✅ **现代技术栈** - 基于 Astro 5.0 + Tailwind CSS + TypeScript
- ✅ **响应式设计** - 支持暗黑模式和 RTL 布局
- ✅ **SEO 优化** - 自动生成站点地图、Open Graph 标签
- ✅ **图像优化** - 使用 Astro Assets 和 Unpic 图像 CDN
- ✅ **博客系统** - 支持 MDX、分类标签、RSS 订阅
- ✅ **分析集成** - 内置 Google Analytics 支持

## 🎯 定制化修改特性

### 1. 增强的按钮组件系统

**位置**: `src/components/ui/Button.astro`

**新增按钮样式**:
- `primary` - 主要按钮样式
- `secondary` - 次要按钮样式  
- `tertiary` - 第三级按钮样式
- `custom` - 自定义按钮（带星光动画）
- `discover` - 发现按钮（带 SVG 动画）
- `uiverse` - 炫酷动画按钮（多圆圈动画效果）
- `link` - 链接样式按钮

**使用方法**:
```astro
<Button variant="uiverse" text="点击我" href="#" target="_blank" />
```

### 2. 多按钮支持的功能模块

**位置**: `src/components/ui/ItemGrid2.astro`

**功能增强**:
- 支持单个 `callToAction` 或多个 `callToActions` 数组
- 自动适配按钮布局和样式
- 响应式设计，移动端友好

**配置示例**:
```astro
callToActions: [
  {
    text: '查看地图',
    href: 'https://maps.example.com',
    variant: 'primary',
    icon: 'tabler:map-pin',
    target: '_blank'
  },
  {
    text: '联系我们', 
    href: '/contact',
    variant: 'secondary',
    icon: 'tabler:phone'
  }
]
```

### 3. 图片资源优化

**改进内容**:
- 修复 Astro 别名路径解析问题
- 使用 `import` 方式导入图片资源
- 支持自动压缩和格式优化

**最佳实践**:
```astro
// ✅ 推荐做法
import heroImage from '~/assets/images/hero.jpg';
<HeroPage backgroundImage={heroImage.src} />

// ❌ 避免做法
<HeroPage backgroundImage="~/assets/images/hero.jpg" />
```

### 4. HTML 内容渲染增强

**位置**: `src/components/widgets/ContentWithImage.astro`

**功能改进**:
- 支持在 `overlayContent` 中使用 HTML 标签
- 使用 `Fragment set:html` 正确渲染 HTML 内容
- 支持换行标签 `<br />` 和其他格式化标签

### 5. 外链新标签页打开

**功能**: 所有外部链接自动在新标签页打开
**安全性**: 自动添加 `rel="noopener noreferrer"` 属性

## 📁 项目结构

```
/
├── public/                 # 静态资源
│   ├── images/            # 公共图片
│   └── robots.txt
├── src/
│   ├── assets/            # 资源文件
│   │   ├── images/        # 图片资源
│   │   └── styles/        # 样式文件
│   │       ├── tailwind.css
│   │       └── uiverse-button.css
│   ├── components/        # 组件
│   │   ├── ui/           # UI 组件
│   │   │   ├── Button.astro
│   │   │   └── ItemGrid2.astro
│   │   └── widgets/      # 页面组件
│   │       ├── HeroPage.astro
│   │       ├── FeatureSet.astro
│   │       ├── ContentWithImage.astro
│   │       └── CallToAction.astro
│   ├── layouts/          # 布局模板
│   ├── pages/            # 页面文件
│   │   ├── company/      # 企业页面
│   │   │   ├── about.astro
│   │   │   ├── contact.astro
│   │   │   └── brand.astro
│   │   └── index.astro
│   ├── types.d.ts        # 类型定义
│   └── config.yaml       # 配置文件
└── package.json
```

## 🛠️ 开发指南

### 环境要求

- Node.js 18.17.1+ / 20.3.0+ / 21.0.0+
- npm 或 yarn 包管理器

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 开发命令

| 命令              | 说明                            |
| ----------------- | ------------------------------- |
| `npm run dev`     | 启动开发服务器 (localhost:4321) |
| `npm run build`   | 构建生产版本到 `./dist/`        |
| `npm run preview` | 预览构建结果                    |
| `npm run check`   | 检查代码错误                    |
| `npm run fix`     | 自动修复代码格式                |

## 🎨 自定义指南

### 样式定制

**主要文件**:
- `src/assets/styles/tailwind.css` - 主样式文件
- `src/components/CustomStyles.astro` - 自定义样式组件

**按钮样式定制**:
1. 在 `tailwind.css` 的 `@layer components` 中添加新样式
2. 在 `Button.astro` 的 `variants` 对象中注册新样式
3. 更新 TypeScript 类型定义

### 组件开发

**创建新组件**:
1. 在 `src/components/` 相应目录下创建 `.astro` 文件
2. 定义 TypeScript 接口（如需要）
3. 添加到相应的页面或布局中

**组件最佳实践**:
- 使用 TypeScript 接口定义 props
- 支持响应式设计
- 遵循 Astro 组件规范
- 添加适当的注释和文档

### 图片资源管理

**添加新图片**:
1. 将图片放入 `src/assets/images/` 目录
2. 使用 `import` 语句导入
3. 通过 `.src` 属性获取优化后的 URL

**图片优化**:
- 自动压缩和格式转换
- 响应式图片生成
- WebP 格式支持
- 懒加载支持

## 🚀 部署指南

### 构建生产版本

```bash
npm run build
```

### 环境配置

**生产环境变量**:
```bash
# .env.production
PUBLIC_SITE_URL=https://your-domain.com
PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 📋 维护指南

### 版本升级

**升级 Astro**:
```bash
npm install astro@latest
npm run check
```

**升级依赖**:
```bash
npm update
npm audit fix
```

## 📞 技术支持

**开发团队**: 宏翔商道技术部
**文档版本**: v3.0
**最后更新**: 2025年07月


## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE.md) 文件。

## 组件

### 纯文字
``` astro
// 引入标题和纯文字的模块
// import TextSection from '~/components/widgets/TextSection.astro';

  <!-- 纯文字的组件 **************** -->
  <!-- <TextSection title="企业文化">
    <p>
      我们致力于构建一个充满活力和创造力的工作环境，鼓励团队合作和持续学习。我们相信，员工的成长是公司发展的基石。我们提供多元化的培训项目和职业发展机会，帮助每位员工实现其职业目标。我们倡导开放、透明的沟通文化，鼓励员工提出创新想法，并积极参与决策过程。我们坚信，通过共同努力，我们可以为客户创造更大的价值，并为社会做出积极贡献。
    </p>
  </TextSection>
```


### 宽屏轮播

``` astro
  import CardSwitcherWide from '~/components/widgets/CardSwitcherWide.astro';

  <!-- 宽屏图片轮播组件 ******************* -->
  <!-- <CardSwitcherWide
    title="环保责任"
    subtitle="为地球的未来着想。"
    description="世界各地的合作伙伴和社区提供支持，因为比起孤军奋战，团结起来能够做到更多。"
    cards={[
      {
        id: 'water-protection',
        title: '保护水资源，',
        subtitle: '为地球的未来着想。',
        image:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        alt: '水资源保护',
      },
    ]}
  /> -->
```



