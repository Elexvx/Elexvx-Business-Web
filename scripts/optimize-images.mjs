import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const root = 'public';
const manifest = {};
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'optimized') await walk(file);
      continue;
    }
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height || meta.width < 400 || (meta.pages ?? 1) > 1) continue;
    const key = '/' + relative(root, file);
    const info = await stat(file);
    const hash = createHash('sha256')
      .update(key + info.size + info.mtimeMs)
      .digest('hex')
      .slice(0, 16);
    const variants = [];
    for (const width of [...new Set([480, 960, 1600].map((w) => Math.min(w, meta.width)))]) {
      const name = `${hash}-${width}.webp`;
      await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(join(root, 'optimized', name));
      variants.push({ src: '/optimized/' + name, width });
    }
    manifest[key] = { width: meta.width, height: meta.height, variants };
  }
}
await mkdir(join(root, 'optimized'), { recursive: true });
await walk(root);
await writeFile('src/data/image-manifest.json', JSON.stringify(manifest));
console.log(`Optimized ${Object.keys(manifest).length} images`);
