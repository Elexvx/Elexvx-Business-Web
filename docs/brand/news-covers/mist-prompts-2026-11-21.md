# 新闻封面：轻雾与通透层次

生成方式：内置 imagegen。六张首页新闻封面保留各自配色，以轻盈的半透明雾层、缓慢卷动的轮廓和前后叠加形成层次；不添加胶片颗粒、点状噪声和纸张纹理。原生输出为 1254 × 1254，网站缩略图缩至 720 × 720 后采用无损 WebP 编码，沿用现有文件名。

## 素材

| 相对仓库根目录的路径 | 配色 |
| --- | --- |
| `public/visuals/news/color-covers/investment-exit-2026.webp` | 杏桃橙、柔珊瑚 |
| `public/visuals/news/color-covers/investment-forward-2026.webp` | 薄荷绿、海水青 |
| `public/visuals/news/color-covers/new-year-progress-2026.webp` | 蜂蜜黄、浅杏橙 |
| `public/visuals/news/color-covers/authorization-withdrawal-2025.webp` | 钴蓝紫、暖杏橙 |
| `public/visuals/news/color-covers/feature-sunset-2025.webp` | 鼠尾草绿、浅翡翠绿 |
| `public/visuals/news/color-covers/appointment-2025.webp` | 雾蓝、浅湖蓝 |

## 蓝色风格参考的实际生成提示

目标文件：`appointment-2025.webp`。输入为该封面之前的雾蓝版本。

> Edit the supplied abstract blue news cover into an airy atmospheric artwork with visible floating mist INSIDE the color. Keep the existing powder-blue, cornflower and lake-blue palette and square full-bleed format. Add two or three broad translucent layers of blue-white vapor that drift, curl very gently and overlap at different depths, like luminous pigment suspended in clear air. Their soft organic silhouettes must be visible enough to create gentle movement and spatial depth, with edges slowly dissolving into the blue. The visual should have a light, floating, ethereal quality, with quiet areas between the drifting mist layers. Smooth clean digitally rendered surfaces, no film grain, no speckles, no dots, no paper texture, no noise or gritty detail. Richer clean blue depth near the lower left, a pale airy veil passing across the middle and a light opening toward the upper right. Moderate contrast, restrained and elegant editorial abstraction, legible as a small thumbnail. It must contain drifting atmospheric structure and subtle layered detail rather than being a plain uniform gradient. No flat two-color gradient, no Gaussian-blurred empty background alone, no text, no objects, no geometry, no borders, no sky, no horizon, no recognizable puffy clouds, no dense smoke column, no fabric or ribbons, no sharp outlines. One single square cover.

## 其余五张的实际生成提示

每张的完整提示为下方共同提示，加上对应的单张构图段落。输入图片 1 为该封面的配色参考，输入图片 2 为上面的蓝色雾感风格参考，仅参考层次和质感。

### 共同提示

> Use case: style-transfer. Image 1 is the edit target: preserve its palette and the square full-bleed format. Image 2 is a STYLE REFERENCE ONLY for the desired clean, floating, translucent mist; do not copy its blue colors or exact composition. Rebuild the target with broad color atmospheres containing two or three airy vapor veils that drift gently and overlap at different depths, like luminous pigment suspended in clear air. Their soft organic silhouettes should create subtle motion and spatial depth; edges dissolve naturally into the color around them. Give the image visible atmospheric structure and suspended light, not a plain uniform gradient. Smooth clean high-resolution digital surface; no film grain, dots, speckles, paper texture, pixel noise, grit or mottling. Light and restrained, elegant editorial abstraction readable at thumbnail size. No text, objects, geometry, borders, sky, horizon, recognizable puffy clouds, heavy smoke column, fabric, ribbons, harsh outlines or spotlight. One single standalone 1:1 abstract cover. Composition and color direction: 

### investment-exit-2026

> Warm apricot-peach fills most of the square with soft coral depth toward the lower right. A warm ivory-peach vapor veil drifts upward from the lower left, widening into a translucent airy layer near the middle; a quieter coral mist floats behind it. Preserve a fresh restrained apricot-coral identity, no blue or violet.

### investment-forward-2026

> Fresh mint-green light in the upper half opens into clean turquoise-teal toward the lower right. Two airy sea-glass and pale mint vapor layers drift diagonally upward and overlap in the central-left area, with more open quiet color in the upper right. Keep the existing mint-teal identity, moderate saturation and clear airy light.

### new-year-progress-2026

> Luminous honey-yellow fills the upper half, warm apricot opens on the left and pale peach fills the lower right. A translucent warm cream-gold mist floats horizontally through the lower middle with a gentle rising curl at one side, layered over a very quiet apricot atmosphere. The mist must remain transparent and light, never solid white or a recognizable cloud landscape.

### authorization-withdrawal-2025

> Keep the original broad cobalt-violet upper field, dusty lavender at the right and warm amber-orange toward the lower left, with restrained midtone contrast. Translucent violet-lavender mist drifts loosely from the upper left into the center and mingles with a light amber veil rising from the lower left. Keep the warm-cool encounter airy and elegant, no ragged pigment outlines or dark murky seams.

### feature-sunset-2025

> Clear pale celadon toward the upper left transitions into eucalyptus and soft jade-green at the lower right. Two thin translucent celadon-green mist layers drift from the right edge toward the center and curl gently upward, with open quiet jade underneath. Light floats within the green, soft volume and layered transparency, no leaves or landscape.
