# 首页 Humite 3D 演示

首页与 Humite 产品主页从 `/visuals/humite-library/index.html` 加载「观文藏阁 · 二层明式藏书空间」。场景源文件位于 `release-assets/humite/visuals/humite-library/`，发布构建会在开放时间后将其复制到静态目录。建筑模型直接同步自 Humite（`Silvae`）仓库内嵌的 `apps/web/public/assets/ming-library` 场景资源，贴图、字体及许可随场景一起分发。

模型在浏览器里随机生成 144 种虚构书目。每个格子独立打乱同类书目，按格宽排满；同一本书可以陈列在多个架位并共用贴图。浏览场景不需要账户、真实馆藏或阅读入口。

需要同步最新建模资源时，在官网仓库执行：

```bash
node scripts/sync-humite-showcase.mjs /path/to/Silvae
```

脚本会同步 `apps/web/public/assets/ming-library` 的全部模型、贴图与脚本，生成带内容哈希的演示构建产物，不修改源仓库；官网构建直接使用生成后的静态资源。
