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
    // Always external — VSCode API is injected by the host
    'vscode',
    // puppeteer-core: native bindings + complex runtime launcher; must stay external
    'puppeteer-core',
    // canvas: optional native addon used by jsdom; not required, but must stay external
    // if present so esbuild doesn't try to bundle a .node file
    'canvas',
    // jsdom: loads its own default-stylesheet.css via fs.readFileSync at module load
    // time using a __dirname-relative path. When bundled by esbuild, __dirname no
    // longer points to the jsdom package directory, so the file lookup fails at runtime.
    // Must stay external so Node resolves it from node_modules with correct __dirname.
    'jsdom',
    // dompurify: used together with jsdom; kept external for consistency.
    'dompurify',
    // All other deps are bundled into dist/extension.js to keep the .vsix small.
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
