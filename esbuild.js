// @ts-check
'use strict';

const esbuild = require('esbuild');
const { argv } = process;

const watch = argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist/extension.js',
  external: [
    'vscode',
    // Bridge: keep legacy extension.js external so its __dirname resolves to
    // the project root (not dist/). Removed when Phase 2.5 TS migration is done.
    '../extension',
    // Large deps loaded at runtime via require() — keep external so
    // node_modules are used directly (avoids bundling ~5MB into dist)
    'puppeteer-core',
    'mermaid',
    'katex',
    'dompurify',
    'jsdom',
    'highlight.js',
    'markdown-it',
    'markdown-it-anchor',
    'markdown-it-checkbox',
    'markdown-it-container',
    'markdown-it-emoji',
    'markdown-it-include',
    'cheerio',
    'gray-matter',
    'mustache',
    'mkdirp',
    'rimraf',
    'emoji-images',
  ],
  sourcemap: true,
  minify: false,
};

async function build() {
  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('esbuild: watching for changes...');
  } else {
    await esbuild.build(options);
    console.log('esbuild: build complete');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
