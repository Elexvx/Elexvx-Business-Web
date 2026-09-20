import { readdir, readFile, stat, unlink } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = resolve('dist');
const manifest = JSON.parse(await readFile('src/data/image-manifest.json', 'utf8'));
const referencedAssets = new Set();
const documentExtensions = new Set(['.html', '.css', '.svg']);
const maxOutputBytes = 160 * 1024 * 1024;

const toLocalPath = (value) => {
  const trimmed = value.trim().replaceAll('&amp;', '&');
  if (!trimmed || /^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(trimmed)) return null;

  let url;
  try {
    url = new URL(trimmed, 'https://local.invalid');
  } catch {
    return null;
  }

  if (
    url.origin !== 'https://local.invalid' &&
    !url.hostname.endsWith('.elexvx.com') &&
    url.hostname !== 'elexvx.com'
  ) {
    return null;
  }

  try {
    return decodeURIComponent(url.pathname);
  } catch {
    return url.pathname;
  }
};

const recordUrlList = (value) => {
  for (const candidate of value.split(',')) {
    const url = candidate.trim().split(/\s+/, 1)[0];
    const localPath = toLocalPath(url);
    if (localPath) referencedAssets.add(localPath);
  }
};

const collectReferences = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collectReferences(file);
      continue;
    }

    const extension = entry.name.slice(entry.name.lastIndexOf('.'));
    if (!documentExtensions.has(extension.toLowerCase())) continue;

    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(
      /(?:src|srcset|imagesrcset|href|xlink:href|content|poster|data-src|data-background)\s*=\s*(["'])(.*?)\1/gi
    )) {
      recordUrlList(match[2]);
    }
    for (const match of text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
      const localPath = toLocalPath(match[2]);
      if (localPath) referencedAssets.add(localPath);
    }
  }
};

const safeOutputPath = (urlPath) => {
  if (!urlPath.startsWith('/')) throw new Error(`Expected an absolute public URL path, received: ${urlPath}`);
  const file = resolve(root, `.${urlPath}`);
  if (!file.startsWith(`${root}${sep}`)) throw new Error(`Asset path escapes the deployment output: ${urlPath}`);
  return file;
};

const removeFile = async (urlPath) => {
  const file = safeOutputPath(urlPath);
  try {
    await unlink(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

const countOutputBytes = async (directory) => {
  let bytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) bytes += await countOutputBytes(file);
    else bytes += (await stat(file)).size;
  }
  return bytes;
};

await collectReferences(root);

let removedImages = 0;
let removedImageBytes = 0;
let retainedReferencedImages = 0;

for (const [sourceUrl, image] of Object.entries(manifest)) {
  const sourceFile = safeOutputPath(sourceUrl);
  const sourceStat = await stat(sourceFile).catch((error) => {
    if (error.code === 'ENOENT') throw new Error(`Expected exported source image is missing: ${sourceUrl}`);
    throw error;
  });

  if (!Array.isArray(image.variants) || image.variants.length === 0) {
    throw new Error(`Responsive image has no generated variants: ${sourceUrl}`);
  }

  for (const variant of image.variants) {
    const variantFile = safeOutputPath(variant.src);
    await stat(variantFile).catch((error) => {
      if (error.code === 'ENOENT')
        throw new Error(`Exported responsive image is missing: ${variant.src} (${sourceUrl})`);
      throw error;
    });
  }

  if (referencedAssets.has(sourceUrl)) {
    retainedReferencedImages++;
    continue;
  }

  if (await removeFile(sourceUrl)) {
    removedImages++;
    removedImageBytes += sourceStat.size;
  }
}

const unusedFullFont = '/fonts/source-han-sans/SourceHanSansCN-VF.woff2';
const removedFullFont = !referencedAssets.has(unusedFullFont) && (await removeFile(unusedFullFont));

const removeFinderMetadata = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) await removeFinderMetadata(file);
    else if (entry.name === '.DS_Store') await unlink(file);
  }
};
await removeFinderMetadata(root);

const outputBytes = await countOutputBytes(root);
const formatMiB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;

console.log(
  `Deployment output: removed ${removedImages} duplicate source images (${formatMiB(removedImageBytes)}), ` +
    `kept ${retainedReferencedImages} images referenced by HTML/CSS metadata, ` +
    `${removedFullFont ? 'removed the unused 7.4 MiB source font, ' : ''}` +
    `final size ${formatMiB(outputBytes)} (budget ${formatMiB(maxOutputBytes)}).`
);

if (outputBytes > maxOutputBytes) {
  throw new Error(
    `Deployment output exceeds the ${formatMiB(maxOutputBytes)} Hobby storage budget. ` +
      `Reduce or externalize assets before publishing.`
  );
}
