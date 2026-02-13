import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

(async () => {
  try {
    await build({
      entryPoints: [path.join(projectRoot, 'src/content/main.tsx')],
      bundle: true,
      format: 'iife',
      splitting: false,
      minify: true,
      outfile: path.join(projectRoot, 'dist/content.js'),
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.css': 'css',
      },
      target: 'es2020',
      metafile: false,
      sourcemap: false,
      logLevel: 'info',
    });
    console.log('content script bundled by esbuild (iife)');
  } catch (err) {
    console.error('esbuild content bundle failed', err);
    process.exit(1);
  }
})();
