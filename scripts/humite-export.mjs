import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import imageManifest from '../src/data/image-manifest.json' with { type: 'json' };
import { isHumiteReleaseDue } from '../src/data/humite-launch.mjs';

export const humiteAssetRoot = 'release-assets/humite';
export const humiteScenePath = '/visuals/humite-library';
export const humiteAssetPaths = Object.entries(imageManifest)
  .filter(([path]) => path.startsWith(`${humiteScenePath}/`) || path === '/products/humite-cover-textured.png')
  .flatMap(([path, { variants }]) => [path, ...variants.map(({ src }) => src)]);

export const isHumitePublicBuild = () => process.env.NEXT_PUBLIC_HUMITE_PUBLISHED !== 'false' && isHumiteReleaseDue();

const protectedPaths = [
  'products/lumira',
  'en/products/lumira',
  'demo/lumira',
  'en/demo/lumira',
  'products/lumira-cover-textured.png',
  'optimized/f35abe95d63513ae-480.webp',
  'optimized/f35abe95d63513ae-960.webp',
  'optimized/f35abe95d63513ae-1254.webp',
  'products/humite',
  'en/products/humite',
  'products/bookkin',
  'en/products/bookkin',
  humiteScenePath.slice(1),
  ...humiteAssetPaths.map((path) => path.slice(1)),
];
const privateContent = /Guanwen Library|观文藏阁|johntao2004\/Silvae|humite-worker/i;
const privateRoute = /\/(?:en\/)?products\/(?:humite|bookkin|lumira)(?:[/"?#<]|$)|\/visuals\/humite-library\//i;
const textExtensions = new Set(['.html', '.json', '.js', '.map', '.txt', '.xml']);

export async function assertHumiteEmbargo(root) {
  for (const path of protectedPaths) {
    const exists = await stat(join(root, path)).then(
      () => true,
      (error) => {
        if (error.code === 'ENOENT') return false;
        throw error;
      }
    );
    if (exists) throw new Error(`Prelaunch export contains a protected path: ${path}`);
  }

  async function check(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await check(path);
        continue;
      }
      const extension = extname(entry.name);
      if (!textExtensions.has(extension)) continue;
      const text = await readFile(path, 'utf8');
      if (privateContent.test(text) || (extension !== '.js' && extension !== '.map' && privateRoute.test(text))) {
        throw new Error(`Prelaunch export contains unpublished Humite content: ${path}`);
      }
    }
  }

  await check(root);
}
