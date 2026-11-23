import { spawn, spawnSync } from 'node:child_process';
import { access, cp } from 'node:fs/promises';
import { isHumiteReleaseDue } from '../src/data/humite-launch.mjs';
import { startHumiteDevAssetServer } from './humite-dev-assets';

const resolveDevPort = (argv: string[], envPort?: string) => {
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg.startsWith('--port=')) {
      const value = arg.slice('--port='.length).trim();
      if (value) return value;
    } else if (arg === '--port') {
      const value = argv[index + 1]?.trim();
      if (value) return value;
    }
  }
  const fallback = envPort?.trim();
  return fallback || '5173';
};

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
  const devPort = resolveDevPort(process.argv.slice(2), process.env.PORT);
  const assetServer = humitePublished ? await startHumiteDevAssetServer() : null;
  if (assetServer) {
    env.HUMITE_DEV_ASSET_ORIGIN = assetServer.origin;
  }

  let exitCode = 1;
  try {
    exitCode = await new Promise<number>((resolveExit, rejectExit) => {
      const child = spawn('next', ['dev', '--hostname', '127.0.0.1', '--port', devPort], {
        env,
        stdio: 'inherit',
      });
      const forwardSignal = (signal: NodeJS.Signals) => {
        child.kill(signal);
      };
      const cleanupListeners = () => {
        process.off('SIGINT', forwardSignal);
        process.off('SIGTERM', forwardSignal);
      };
      process.on('SIGINT', forwardSignal);
      process.on('SIGTERM', forwardSignal);
      child.once('error', (error) => {
        cleanupListeners();
        rejectExit(error);
      });
      child.once('exit', (code, signal) => {
        cleanupListeners();
        resolveExit(signal ? 1 : (code ?? 1));
      });
    });
  } finally {
    await assetServer?.close();
  }
  process.exit(exitCode);
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
