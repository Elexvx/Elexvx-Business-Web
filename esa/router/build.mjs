import { build } from 'esbuild';

await build({
  entryPoints: ['../../src/server/esa/gateway.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
});
