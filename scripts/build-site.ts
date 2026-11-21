import { spawnSync } from 'node:child_process';
import { access, cp } from 'node:fs/promises';
import { isHumiteReleaseDue } from '../src/data/humite-launch.mjs';

const dev = process.argv.includes('--dev');
const humitePublished = isHumiteReleaseDue();
const env: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: dev ? 'development' : 'production',
  NEXT_PUBLIC_HUMITE_PUBLISHED: String(humitePublished),
};
if (humitePublished) {
  await Promise.all([access('release-assets/humite-content.ts'), access('release-assets/humite')]).catch(() => {
    throw new Error(
      'The launch time has arrived. The Humite release source and assets are required to build the site.'
    );
  });
  env.NODE_OPTIONS = [env.NODE_OPTIONS, '--conditions=humite-release'].filter(Boolean).join(' ');
}
const run = (command: string, ...args: string[]) => {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};
const npm = (...args: string[]) => run('npm', 'run', ...args);

npm('generate:site-data');
if (dev) {
  run('next', 'dev', '--hostname', '127.0.0.1', '--port', '5173');
} else {
  const esa = process.argv.includes('--esa');
  if (esa) {
    npm('test');
    npm('content:check');
    npm('lint');
    npm('typecheck');
  }
  run('next', 'build');
  if (humitePublished) await cp('release-assets/humite', 'dist', { recursive: true });
  run('tsx', 'scripts/generate-site.tsx');
  run('tsx', 'scripts/inline-home-css.ts');
  run('node', 'scripts/prune-deployment-output.mjs');
  run('tsx', 'scripts/generate-indexnow-manifest.ts');
  npm('i18n:check');
  if (esa) {
    run('node', 'scripts/build-esa.mjs');
    npm('check:esa-output');
  }
}
