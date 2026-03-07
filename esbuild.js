// @ts-check
'use strict';

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { argv } = process;

const watch = argv.includes('--watch');

/**
 * esbuild plugin: patch jsdom internals that break when bundled.
 *
 * Two issues:
 *
 * 1. style-rules.js loads its UA stylesheet via:
 *      fs.readFileSync(path.resolve(__dirname, '../../browser/default-stylesheet.css'), ...)
 *    When bundled, __dirname = dist/ and two levels up escapes the extension folder.
 *    Fix: inline the CSS as a string literal at build time.
 *
 * 2. XMLHttpRequest-impl.js does at the top level:
 *      const syncWorkerFile = require.resolve('./xhr-sync-worker.js');
 *    require.resolve at runtime needs a real file path; the bundled file has none.
 *    We never use synchronous XHR, so replacing with null is safe.
 *
 * @type {import('esbuild').Plugin}
 */
const jsdomPatchPlugin = {
  name: 'jsdom-patch',
  setup(build) {
    // Patch 1: inline the UA stylesheet
    build.onLoad({ filter: /style-rules\.js$/ }, (args) => {
      if (!args.path.includes('jsdom')) return undefined;
      let src = fs.readFileSync(args.path, 'utf8');
      const cssFile = path.resolve(path.dirname(args.path), '../../browser/default-stylesheet.css');
      const cssJson = JSON.stringify(fs.readFileSync(cssFile, 'utf8'));
      src = src.replace(
        /fs\.readFileSync\(\s*path\.resolve\(__dirname[\s\S]*?default-stylesheet\.css[\s\S]*?\)[^)]*\)/,
        cssJson
      );
      return { contents: src, loader: 'js' };
    });

    // Patch 2: neutralise the sync-XHR worker path lookup
    build.onLoad({ filter: /XMLHttpRequest-impl\.js$/ }, (args) => {
      if (!args.path.includes('jsdom')) return undefined;
      let src = fs.readFileSync(args.path, 'utf8');
      // Replace the top-level require.resolve with null — syncWorker is never
      // constructed by our code (DOMPurify uses the DOM API, not XHR).
      src = src.replace(
        /const syncWorkerFile = require\.resolve\(["']\.\/xhr-sync-worker\.js["']\);/,
        'const syncWorkerFile = null; // patched by esbuild.js (sync XHR unused)'
      );
      return { contents: src, loader: 'js' };
    });
  },
};

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist/extension.js',
  plugins: [jsdomPatchPlugin],
  external: [
    // Always external — VSCode API is injected by the host
    'vscode',
    // puppeteer-core: native bindings + complex runtime launcher; must stay external
    'puppeteer-core',
    // canvas: optional native addon used by jsdom; not required, but must stay external
    // if present so esbuild doesn't try to bundle a .node file
    'canvas',
    // All other deps (including jsdom and dompurify) are bundled into dist/extension.js.
    // jsdom's default-stylesheet.css is inlined at build time by jsdomCssInlinePlugin.
    // mermaid.min.js, katex CSS/fonts, highlight.js styles, and emoji-images PNGs
    // are file-system assets read at runtime and handled via .vscodeignore allowlist.
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
