import { readdir, mkdir, writeFile, stat, unlink } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { format } from 'prettier';
import { humiteAssetRoot } from './humite-export.mjs';

const manifest = {};

const HOME_FEATURED_IMAGES = new Set([
  'activities/aigc-training-2026/classroom-overview.jpg',
  'activities/jimihui-enterprise-brand-ip-2026/event-program.webp',
  'activities/jimihui-entrepreneur-salon-4-2025/group-photo.webp',
  'activities/jinxi-2026/jinxi-2026-group-photo.jpg',
  'products/humite-cover-textured.png',
]);

async function walk(root, dir, generated) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'optimized') await walk(root, file, generated);
      continue;
    }
    const relativePath = relative(root, file).split('\\').join('/');
    const isWebp = /\.webp$/i.test(file);
    const isEcosystemLogo = relativePath.startsWith('brand/ecosystem/');
    const isNewsCoverWebp = isWebp && relativePath.startsWith('visuals/news/color-covers/');
    const isManagedWebp =
      isWebp && /^(?:activities|visuals\/news|visuals\/research\/color-covers)\//.test(relativePath);
    if (!/\.(png|jpe?g)$/i.test(file) && !isManagedWebp) continue;
    const info = await stat(file);
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height || (meta.pages ?? 1) > 1) continue;
    const key = '/' + relativePath;
    if (isManagedWebp && (info.size < 30_000 || meta.width < 400)) {
      manifest[key] = { width: meta.width, height: meta.height, variants: [] };
      continue;
    }
    if (meta.width < 400) continue;
    const isShowcasePreview = relativePath === 'products/humite-library-preview.png';
    const hash = createHash('sha256')
      .update(`${key}:${info.size}:${info.mtimeMs}:${isShowcasePreview ? 'v4-q74-80' : 'v2-q74'}`)
      .digest('hex')
      .slice(0, 16);
    const variants = [];
    const targetWidths = isEcosystemLogo
      ? [160, 480]
      : isNewsCoverWebp
        ? [360, 720]
        : isShowcasePreview
          ? [480, 720, 960, 1440, 1920, 2560]
          : HOME_FEATURED_IMAGES.has(relativePath)
            ? [240, 480, 720, 960, 1440]
            : isManagedWebp
              ? [480, 960, 1440]
              : [480, 960, 1600];
    for (const width of [...new Set(targetWidths.map((w) => Math.min(w, meta.width)))]) {
      const name = `${hash}-${width}.webp`;
      const outPath = join(root, 'optimized', name);
      generated.add(name);
      const alreadyExists = await stat(outPath).then(
        (entry) => entry.isFile(),
        () => false
      );
      if (!alreadyExists) {
        await sharp(file)
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({
            quality: isShowcasePreview ? (width <= 960 ? 74 : 80) : isNewsCoverWebp ? 76 : 74,
            effort: 6,
            smartSubsample: true,
          })
          .toFile(outPath);
      }
      variants.push({ src: '/optimized/' + name, width });
    }
    manifest[key] = { width: meta.width, height: meta.height, variants };
  }
}

for (const root of ['public', humiteAssetRoot]) {
  const optimizedDir = join(root, 'optimized');
  await mkdir(optimizedDir, { recursive: true });
  const generated = new Set();
  await walk(root, root, generated);
  for (const entry of await readdir(optimizedDir, { withFileTypes: true })) {
    if (entry.isFile() && !generated.has(entry.name)) {
      await unlink(join(optimizedDir, entry.name));
    }
  }
}
await writeFile('src/data/image-manifest.json', await format(JSON.stringify(manifest), { parser: 'json' }));
console.log(`Optimized ${Object.keys(manifest).length} images`);
