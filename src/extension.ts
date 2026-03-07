// Phase 2.1 bridge: re-exports from the existing extension.js so the esbuild
// pipeline is live and tested before the full TypeScript migration in Phase 2.5+.
// This file will be replaced with native TypeScript modules in Phase 2.5.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const legacy = require('../extension');

export function activate(context: unknown): void {
  return legacy.activate(context);
}

export function deactivate(): void {
  return legacy.deactivate();
}
