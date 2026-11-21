import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { format } from 'prettier';
import { humiteAssetRoot } from './humite-export.mjs';

const manifest = {};
async function walk(root, dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'optimized') await walk(root, file);
      continue;
    }
    const relativePath = relative(root, file).split('\\').join('/');
    const isNewsCoverWebp = relativePath.startsWith('visuals/news/color-covers/') && /\.webp$/i.test(file);
    if (!/\.(png|jpe?g)$/i.test(file) && !isNewsCoverWebp) continue;
    const info = await stat(file);
    if (isNewsCoverWebp && info.size < 200_000) continue;
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height || meta.width < 400 || (meta.pages ?? 1) > 1) continue;
    const key = '/' + relative(root, file);
    const hash = createHash('sha256')
      .update(key + info.size + info.mtimeMs)
      .digest('hex')
      .slice(0, 16);
    const variants = [];
    const targetWidths = isNewsCoverWebp ? [360, 720] : [480, 960, 1600];
    for (const width of [...new Set(targetWidths.map((w) => Math.min(w, meta.width)))]) {
      const name = `${hash}-${width}.webp`;
      await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: isNewsCoverWebp ? 82 : 80 })
        .toFile(join(root, 'optimized', name));
      variants.push({ src: '/optimized/' + name, width });
    }
    manifest[key] = { width: meta.width, height: meta.height, variants };
  }
}
for (const root of ['public', humiteAssetRoot]) {
  await mkdir(join(root, 'optimized'), { recursive: true });
  await walk(root, root);
}
await writeFile('src/data/image-manifest.json', await format(JSON.stringify(manifest), { parser: 'json' }));
console.log(`Optimized ${Object.keys(manifest).length} images`);
