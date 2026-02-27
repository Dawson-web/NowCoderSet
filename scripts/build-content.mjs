import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// 自定义 esbuild 插件：让 CSS 文件经过 PostCSS（Tailwind）处理
const postcssPlugin = {
  name: 'postcss',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const raw = await fs.promises.readFile(args.path, 'utf8');
      const result = await postcss([tailwindcss, autoprefixer]).process(raw, {
        from: args.path,
      });
      return { contents: result.css, loader: 'css' };
    });
  },
};

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
      },
      alias: {
        '@': path.join(projectRoot, 'src'),
      },
      plugins: [postcssPlugin],
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
