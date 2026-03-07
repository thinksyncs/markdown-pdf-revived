# Markdown PDF (Revived) - Implementation Tasks

**Project:** Modernize abandoned vscode-markdown-pdf extension
**Tagline:** A privacy-first, offline-capable Markdown to PDF converter for VSCode
**Started:** 7 March 2026
**Status:** Phase 4 Documentation Complete — ready for manual testing
**Last Updated:** 7 March 2026

---

## Phase 1: Critical Fixes (Week 1-2)

**Goal:** Make the extension functional and secure again.

### 1.0 Scope Decisions

- [x] Remove PNG/JPEG export (lean PDF/HTML focus)
- [x] Remove PlantUML (privacy/offline)
- [x] Remove Chromium auto-download (use system Chrome)
- [x] Remove Japanese README (`README.ja.md`) — fork is English-only, no-nonsense single-purpose tool

### 1.1 Repository Setup

- [x] Fork original repository on GitHub
- [x] Clone fork to local machine
- [x] Create new branch: `main` → `revived-main`
- [x] Install dependencies: `npm install`
- [ ] Verify extension runs in VSCode (test current state)
- [ ] Create `CHANGELOG.md` with initial entry
- [ ] Create `MIGRATION.md` draft

### 1.2 Remove PlantUML (Privacy/Offline Positioning) ✅ COMPLETE

- [x] Remove PlantUML code from `extension.js` (lines 269-276)
- [x] Remove `markdown-it-plantuml` from `package.json` dependencies
- [x] Remove PlantUML settings from `package.json`:
  - [x] `markdown-pdf.plantumlOpenMarker`
  - [x] `markdown-pdf.plantumlCloseMarker`
  - [x] `markdown-pdf.plantumlServer`
- [x] Remove PlantUML section from `README.md`
- [x] Remove PlantUML example images from `images/`
- [x] Update `README.md` with Mermaid migration guide
- [x] Test: PlantUML diagrams no longer render (expected behavior — code removed)
- [x] Test: Extension still works without PlantUML (static audit: 0 PlantUML refs in codebase)

### 1.3 Remove PNG/JPEG Export ✅ COMPLETE

- [x] Remove PNG/JPEG screenshot block from `exportPdf()` in `extension.js`
- [x] Remove PNG/JPEG command registrations from `extension.js`
- [x] Remove PNG/JPEG from `types_format` array (now `['html', 'pdf']`)
- [x] Remove PNG/JPEG settings from `package.json`:
  - [x] `markdown-pdf.quality`
  - [x] `markdown-pdf.clip.x`
  - [x] `markdown-pdf.clip.y`
  - [x] `markdown-pdf.clip.width`
  - [x] `markdown-pdf.clip.height`
  - [x] `markdown-pdf.omitBackground`
- [x] Remove PNG/JPEG `activationEvents` from `package.json`
- [x] Remove PNG/JPEG command definitions and menu entries from `package.json`
- [x] Update "Export all" command title to `all: pdf, html`
- [x] Document `mermaidServer` CDN issue in `MODERNIZATION_PLAN.md` with options
- [x] Test: PNG/JPEG commands no longer appear in command palette (static audit confirmed; missed commandPalette entries fixed in 1.6)
- [ ] Test: PDF export still works (requires VSCode — manual test in Phase 1.6 live testing)
- [ ] Test: HTML export still works (requires VSCode — manual test in Phase 1.6 live testing)

### 1.4 Update Dependencies + Merge Community PRs ✅ COMPLETE

**Puppeteer upgrade (addresses PR #365 concept):**
- [x] `puppeteer-core`: ^2.1.1 → ^24.38.0 (fixes Mermaid — old Chromium v80 lacked modern JS)
- [x] Remove `installChromium()` — used `createBrowserFetcher` removed in v20+
- [x] Add `getChromiumDefaultPaths()` for cross-platform Chrome auto-detection
- [x] Refactor `checkPuppeteerBinary()` and `exportPdf()` launch for v24 API
- [x] `init()` shows clear error if Chrome not found (instead of silent fail)

**KaTeX math support (addresses PR #386 concept):**
- [x] Added `katex: ^0.16.37`
- [x] Added `markdown-pdf.math` setting (boolean, default `true`)
- [x] Implemented self-contained `markdownItKaTeX` plugin using `katex` directly
  - Avoids `markdown-it-katex` (XSS CVE, no fix) and `@iktakahiro/markdown-it-katex` (bundles vulnerable katex)
  - Supports `$...$` inline and `$$...$$` display math
- [x] KaTeX CSS linked via absolute `file://` path (preserves font resolution)
- [x] Fix `markdownItKaTeX` block rule — single-line `$$formula$$` was not matched; rewritten to handle both single-line and multi-line `$$...$$` display math
- [x] Fix `tables.md` confusing KaTeX row description (replaced `\`$...$\`` literal with plain text)
- [ ] Test: math renders correctly in PDF (requires VSCode — use test-docs/math.md)
- [ ] Test: math renders correctly in HTML (requires VSCode — use test-docs/math.md)

**Local Mermaid bundling (resolves CDN issue documented in 1.3):**
- [x] Added `mermaid: ^11.12.3`
- [x] Removed `markdown-pdf.mermaidServer` setting entirely
- [x] `makeHtml()` inlines Mermaid from `node_modules` — 100% offline, no CDN
- [ ] Test: Mermaid diagrams render correctly in PDF (requires VSCode — use test-docs/mermaid.md)
- [ ] Test: Mermaid diagrams render correctly in HTML (requires VSCode — use test-docs/mermaid.md)

**Replaced vulnerable packages:**
- [x] `markdown-it-named-headers` → `markdown-it-anchor: ^9.2.0` (was depending on `string` ReDoS CVE)
- [x] Removed `markdown-it-katex` (XSS CVE, no fix available)
- [x] Removed `vscode-test` → `@vscode/test-electron: ^2.5.2`

**All other deps updated to latest:**
- [x] `markdown-it`: ^10.0.0 → ^14.1.1
- [x] `highlight.js`: ^9.18.1 → ^11.11.1
- [x] `cheerio`: ^0.20.0 → ^1.0.0
- [x] `markdown-it-emoji`: ^1.4.0 → ^3.0.0
- [x] `markdown-it-container`: ^2.0.0 → ^4.0.0
- [x] `markdown-it-include`: ^1.1.0 → ^2.0.0
- [x] `mustache`: ^4.0.1 → ^4.2.0
- [x] `mkdirp`: ^1.0.3 → ^3.0.1
- [x] `rimraf`: ^3.0.2 → ^6.1.3
- [x] `gray-matter`: ^4.0.2 → ^4.0.3
- [x] `glob`: ^7.1.6 → ^13.0.6 (dev)
- [x] `mocha`: ^7.1.1 → ^11.7.5 (dev)
- [x] vscode engine: `^1.0.0` → `^1.85.0`

**Security:**
- [x] `npm audit --omit=dev` → **0 vulnerabilities** in production
- [x] 3 remaining vulns are mocha devDep only — do not ship with extension
- [x] PR #418 (Puppeteer language setting) — already present in original code, retained

**PR #399 (PDF/HTML consistency):**
- [ ] Still to investigate and implement in Phase 1.6 verification pass

### 1.5 Fix Security Vulnerability (CVE-2024-7739) ✅ COMPLETE

- [x] Add `dompurify: ^3.3.2` dependency
- [x] Add `jsdom: ^28.1.0` dependency
- [x] Implement `sanitizeContent()` in `extension.js` using DOMPurify + jsdom
- [x] Sanitize only user-supplied markdown content — not trusted internal assets (Mermaid script, styles)
- [x] Fail-closed: if sanitization errors, export is blocked and user is notified
- [x] Guard `exportPdf()` call site — aborts if `makeHtml()` returns null
- [x] DOMPurify config preserves Mermaid `data-*` attributes and KaTeX/MathML/SVG elements
- [x] DOMPurify config explicitly forbids `<script>`, `<iframe>`, `<object>`, `<embed>`, `<base>` and all inline event handlers
- [x] `npm audit --omit=dev` still shows 0 production vulnerabilities
- [ ] Test with malicious markdown input (requires VSCode — use test-docs/security-xss.md)
- [ ] Test that legitimate content (tables, code, Mermaid, KaTeX) still renders correctly (requires VSCode — all test-docs/)
- [ ] Document security improvements in README (Phase 4)

### 1.6 Phase 1 Verification ✅ COMPLETE (static); manual VSCode tests pending

**Static code audits (all pass):**
- [x] No PlantUML references in extension.js or package.json (grep: 0 matches)
- [x] No PNG/JPEG export code in extension.js (grep: 0 matches)
- [x] No PNG/JPEG commands in package.json (missed commandPalette entries — found and fixed)
- [x] No `mermaidServer` references anywhere (grep: 0 matches)
- [x] No `installChromium`/`createBrowserFetcher` references (grep: 0 matches)
- [x] `sanitizeContent()` present in extension.js (3 refs)
- [x] `markdownItKaTeX()` present in extension.js (2 refs)
- [x] Mermaid inlined from node_modules (1 ref)
- [x] `waitForFunction` (PR #399 fix) present (1 ref)
- [x] `npm audit --omit=dev` → 0 vulnerabilities

**Fixes applied in this phase:**
- [x] Removed stale comment "convert and export markdown to pdf, html, png, jpeg"
- [x] Removed leftover PNG/JPEG `when` conditions from `commandPalette` block in package.json
- [x] PR #399 (PDF/HTML consistency): implemented `waitForFunction` to wait for Mermaid async rendering before PDF capture
- [x] Created test-docs/: basic.md, code.md, tables.md, math.md, mermaid.md, security-xss.md

**Manual VSCode tests (to be completed before Phase 2 merge):**
- [ ] PDF export works (test-docs/basic.md)
- [ ] HTML export works (test-docs/basic.md)
- [ ] Syntax highlighting renders (test-docs/code.md)
- [ ] Tables render (test-docs/tables.md)
- [ ] KaTeX math renders — inline and display (test-docs/math.md)
- [ ] Mermaid diagrams render in PDF — all 5 diagram types (test-docs/mermaid.md)
- [ ] Mermaid diagrams render in HTML (test-docs/mermaid.md)
- [ ] XSS payloads stripped, legitimate content preserved (test-docs/security-xss.md)
- [ ] PNG/JPEG commands absent from command palette
- [ ] No console errors in VSCode developer tools
- [ ] Extension loads in < 2 seconds

---

## Phase 2: Architecture Refactoring (Week 3-4)

**Goal:** Transform from monolithic JS file to modular TypeScript codebase.

### 2.1 Set Up TypeScript ✅ COMPLETE

- [x] Add `typescript: ^5.9.3` as dev dependency
- [x] Add `@types/node` and `@types/vscode` as dev dependencies
- [x] Create `tsconfig.json` — strict mode, ES2020, commonjs, rootDir `src/`, outDir `dist/`
- [x] `tsc --noEmit` → 0 errors

### 2.2 Set Up Build System (esbuild) ✅ COMPLETE

- [x] Add `esbuild: ^0.27.3` as dev dependency
- [x] Create `esbuild.js` build script
- [x] Bundle target: `src/extension.ts` → `dist/extension.js`; all large runtime deps kept external
- [x] Updated `package.json` `"main"` → `"./dist/extension"`
- [x] Added scripts: `build` (`node esbuild.js`), `watch` (`node esbuild.js --watch`), `vscode:prepublish` (`node esbuild.js`)
- [x] Created `src/extension.ts` bridge that delegates to `extension.js` — build pipeline live before full TS migration
- [x] `npm run build` → dist/extension.js (33KB) + sourcemap — build complete
- [x] Added `dist/` and `.DS_Store` to `.gitignore`

### 2.3 Set Up Linting & Formatting — DEFERRED to post-Phase 3

- [ ] Add `eslint` as dev dependency
- [ ] Add `@typescript-eslint/parser` and plugin
- [ ] Create `.eslintrc.json` with TypeScript rules
- [ ] Add `prettier` as dev dependency
- [ ] Create `.prettierrc` configuration
- [ ] Add lint script: `npm run lint`
- [ ] Add format script: `npm run format`
- [ ] Configure VSCode settings for auto-format

### 2.4 Set Up Testing — DEFERRED to post-Phase 3

- [ ] Add `jest` as dev dependency
- [ ] Add `ts-jest` for TypeScript support
- [ ] Create `jest.config.js`
- [ ] Add test script: `npm test`
- [ ] Create test directory structure: `tests/`
- [ ] Write first test (smoke test)
- [ ] Set up test coverage reporting
- [ ] Configure CI-ready test output

### 2.5–2.7 TypeScript Migration ✅ COMPLETE

**Branch:** `feature/phase-2-5-typescript-migration`

- [x] Created modular src/ structure:
  ```
  src/
  ├── extension.ts
  ├── commands/
  │   ├── exportPdf.ts
  │   ├── exportHtml.ts
  │   └── showSettings.ts
  ├── converters/
  │   ├── markdownToHtml.ts
  │   ├── plugins.ts
  │   └── sanitizeHtml.ts
  ├── exporters/
  │   ├── pdfExporter.ts
  │   └── htmlExporter.ts
  ├── config/
  │   ├── settings.ts
  │   └── types.ts
  ├── styles/
  │   ├── loadStyles.ts
  │   └── defaultStyles.ts
  └── utils/
      ├── pathUtils.ts
      ├── fileUtils.ts
      └── logger.ts
  ```
- [x] `src/types.ts` — ExportType, OptionType
- [x] `src/config/settings.ts` — EXTENSION_ROOT (`path.join(__dirname, '..')`), typed config accessors
- [x] `src/utils/logger.ts` — showErrorMessage, setBooleanValue
- [x] `src/utils/file.ts` — readFile, isExistsPath, isExistsDir, deleteFile, mkdir
- [x] `src/converter/slug.ts` — heading slug
- [x] `src/converter/katex.ts` — markdownItKaTeX plugin (inline, no third-party)
- [x] `src/converter/sanitize.ts` — DOMPurify (CVE-2024-7739)
- [x] `src/converter/markdown.ts` — convertMarkdownToHtml with all plugins
- [x] `src/template/page.ts` — makeHtml, readStyles, getOutputDir, fixHref
- [x] `src/exporter/html.ts` — exportHtml
- [x] `src/exporter/pdf.ts` — exportPdf, checkPuppeteerBinary, Mermaid wait fix
- [x] `src/extension.ts` — activate/deactivate, commands (replaces Phase 2.1 bridge)
- [x] strict TypeScript: `tsc --noEmit` → 0 errors
- [x] `npm run build` → dist/extension.js complete
- [x] `../extension` bridge removed from esbuild; extension.js no longer loaded

### 2.8 Phase 2 Verification ✅ COMPLETE

- [x] `npm run build` → 0 errors
- [x] `tsc --noEmit` → 0 errors
- [x] `npm audit --omit=dev` → 0 vulnerabilities
- [x] Manual testing: basic, math, mermaid exports verified in VSCodium — no errors
- [ ] `npm run lint` — deferred (ESLint setup in 2.3 deferred)
- [ ] `npm test` — deferred (Jest setup in 2.4 deferred)

---

## Phase 3: Feature Cleanup (Week 5-6)

**Goal:** Remove unnecessary features, simplify settings, modernize defaults.

### 3.1 Simplify Settings ✅ COMPLETE

- [x] Remove obsolete settings from `package.json`:
  - [x] `stylesRelativePathFile`
  - [x] `outputDirectoryRelativePathFile`
  - [x] `includeDefaultStyles`
  - [x] `scale`
  - [x] `pageRanges`
  - [x] `width` / `height`
  - [x] `markdown-it-include.enable` (always enabled)
  - [x] `StatusbarMessageTimeout` (hardcoded 10000ms)
  - [x] `debug` (always delete tmp files)
- [ ] Consolidate margin settings into single object
- [ ] Update settings UI labels for clarity
- [ ] Add setting descriptions with examples
- [ ] Group settings logically in settings UI
- [ ] Test settings UI displays correctly

### 3.2 Modernize Default Values ✅ COMPLETE

- [x] Update default format: A4 (keep)
- [x] Update default margins: 2cm top/bottom, 2.5cm left/right (was 1.5cm/1cm/1cm/1cm)
- [x] Update default syntax theme: `github.css` (was empty → fell back to tomorrow.css)
- [ ] Update default line height: 1.7 — in CSS (Phase 3.3)
- [ ] Update default font size: 15px — in CSS (Phase 3.3)
- [x] Enable KaTeX by default: `true` (already was)
- [x] Enable emoji by default: `true` (already was)
- [x] Disable header/footer by default (was `true`)
- [ ] Test defaults produce beautiful output — after Phase 3.3

### 3.3 Rewrite CSS with Modern Styling ✅ COMPLETE

- [x] Rewrote `styles/markdown.css` from scratch — replaced VSCode editor stylesheet
  - [x] Modern font stack: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - [x] Line height: 1.7
  - [x] Font size: 15px base
  - [x] Heading hierarchy with border-bottom separators (h1/h2)
  - [x] Task list checkbox alignment
  - [x] Blockquote: left border + subtle background
- [x] Rewrote `styles/markdown-pdf.css` (PDF/HTML overrides)
  - [x] Code blocks: `#f6f8fa` background, 6px radius, 1.25em padding
  - [x] Mermaid SVG centering and max-width
  - [x] KaTeX display: overflow-x scroll for wide formulas
  - [x] Tables: `display: table-header-group` for multi-page repeat headers
  - [x] `@media print`: 13px body, page-break-inside avoid on pre/blockquote/headings
  - [x] Striped table rows (`nth-child(even)`)
  - [x] `.page` utility class for explicit page breaks

### 3.4 Improve Accessibility ✅ COMPLETE

- [x] Audit color contrast (WCAG AA minimum) — all 9 color pairs pass (lowest: del #6b7280 at 4.83:1)
- [x] No low contrast text found — all pairs ≥ 4.5:1
- [x] Add `lang="en"` to `<html>` — fixes WCAG 2.1 Level A (3.1.1)
- [x] Add `<main>` landmark around content — screen reader navigation
- [x] Add `<meta charset="UTF-8">` and `<meta name="viewport">` to template
- [x] Remove stale `.vscode-dark`/`.vscode-high-contrast` Mermaid theme detection
- [x] Escape title with `{{title}}` (was `{{{title}}}`) — XSS-safe filename in `<title>`

### 3.5 Update Template ✅ COMPLETE (completed during 3.4)

- [x] Modernize `template/template.html` — clean, minimal, no cruft
- [x] HTML5 semantic elements — `<main>` landmark wraps content
- [x] Meta tags — `charset`, `viewport`
- [x] CSS variables for theming — SKIP (KISS; no user benefit in a PDF exporter)
- [x] KaTeX CSS — linked via `readStyles()` in `page.ts` (done Phase 1)
- [x] Mermaid JS bundled from `node_modules` — inlined via `makeHtml()` (done Phase 1)
- [x] No external CDN dependencies — zero since Phase 1.4

### 3.6 Phase 3 Verification ✅ COMPLETE

**Automated (static):**
- [x] `npm run build` → 0 errors; `dist/extension.js` 26.8 KB
- [x] `tsc --noEmit` → 0 errors
- [x] `npm audit --omit=dev` → 0 vulnerabilities
- [x] Settings count: 21 (down from ~30); all have descriptions
- [x] Template: `doctype`, `lang=en`, `charset`, `viewport`, `<main>`, `<title>` all present
- [x] No CDN references in any source file
- [x] CSS contrast audit: all color pairs pass WCAG AA (min 4.83:1)

**Manual (requires VSCode — defer to pre-release):**
- [ ] Settings UI renders correctly with 21 settings
- [ ] PDF export with basic.md — modern typography verified
- [ ] PDF export with math.md — KaTeX renders
- [ ] PDF export with mermaid.md — diagrams render
- [ ] HTML export — valid HTML5, no external requests

---

## Phase 4: Documentation & Release (Week 7-8)

**Goal:** Prepare for public release with comprehensive documentation.

### 4.1 Write README

- [x] Write compelling introduction (use marketing copy)
- [x] Add installation instructions
- [x] Add quick start guide
- [x] Document all features
- [x] Document all settings (simplified list)
- [x] Add Mermaid migration guide (from PlantUML)
- [x] Add troubleshooting section
- [x] Add FAQ
- [x] Add comparison table (Original vs Revived)
- [x] Add badges (version, downloads, license)
- [ ] Add screenshots of sample output
- [x] Add contribution guidelines
- [x] Add link to CHANGELOG and MIGRATION

### 4.2 Write Migration Guide

- [x] Document breaking changes
- [x] Document removed features (PNG/JPEG, PlantUML)
- [x] Document setting changes
- [x] Provide Mermaid conversion examples
- [x] Document workflow changes
- [x] Add FAQ for common migration issues
- [ ] Test migration with original extension users

### 4.3 Write Changelog

- [x] Set up Keep a Changelog format
- [x] Document v2.0.0 changes:
  - [x] Changed section (dependencies, architecture)
  - [x] Added section (KaTeX, security, tests)
  - [x] Removed section (PNG/JPEG, PlantUML, settings)
  - [x] Fixed section (Mermaid, PDF/HTML consistency)
- [x] Add migration notes
- [x] Link to relevant issues/PRs

### 4.4 Update Package Metadata

- [x] Update `package.json` name (if changing)
- [x] Update `package.json` displayName
- [x] Update `package.json` description
- [x] Update `package.json` version to 2.0.0
- [x] Update `package.json` author/maintainer
- [x] Update `package.json` repository URL
- [x] Update `package.json` keywords
- [x] Update `package.json` categories
- [x] Update `package.json` activation events
- [x] Update `package.json` VSCode engine version

### 4.5 Create Visual Assets (Optional)

- [ ] Design extension icon (128x128px)
- [ ] Design marketplace banner (1280x640px)
- [ ] Create screenshots for marketplace
- [ ] Add icon to `package.json`
- [ ] Add banner to `package.json`

### 4.6 Final Testing

- [ ] Test extension in VSCode stable
- [ ] Test extension in VSCode insiders
- [ ] Test on Windows
- [ ] Test on macOS
- [ ] Test on Linux
- [ ] Test with complex markdown files
- [ ] Test with large documents (50+ pages)
- [ ] Test with all settings combinations
- [ ] Performance test (load time, export time)
- [ ] Memory usage test
- [ ] Fix all discovered issues

### 4.7 Package Extension

- [ ] Install `@vscode/vsce` globally
- [ ] Run `vsce package` to create .vsix
- [ ] Test .vsix installs correctly
- [ ] Test .vsix works after install
- [ ] Verify package size is reasonable (< 50MB)

### 4.8 Publish to VSCode Marketplace

- [ ] Create marketplace publisher account
- [ ] Create personal access token
- [ ] Configure publisher in `package.json`
- [ ] Run `vsce publish`
- [ ] Verify extension appears in marketplace
- [ ] Write marketplace description
- [ ] Add tags: markdown, pdf, privacy, offline
- [ ] Add gallery banner color/theme

### 4.9 Announce Release

- [ ] Post announcement on original repo issues
- [ ] Post announcement on original repo PRs
- [ ] Share on Reddit r/vscode
- [ ] Share on Twitter/X
- [ ] Share on relevant Discord/Slack communities
- [ ] Update personal website/blog (optional)
- [ ] Respond to all comments/questions

### 4.10 Post-Release

- [ ] Monitor issues for bug reports
- [ ] Respond to all issues within 1 week
- [ ] Monitor marketplace reviews
- [ ] Respond to all reviews
- [ ] Track download metrics
- [ ] Plan v2.1.0 features
- [ ] Set up automated dependency updates (Dependabot)
- [ ] Set up CI/CD (GitHub Actions)

---

## Long-Term Maintenance (Ongoing)

### Monthly

- [ ] Check for dependency updates
- [ ] Review `npm audit` for vulnerabilities
- [ ] Triage new issues
- [ ] Review community PRs

### Quarterly

- [ ] Release minor version update
- [ ] Update major dependencies
- [ ] Review and update documentation
- [ ] Check VSCode API changes

### Annually

- [ ] Release major version update
- [ ] Comprehensive security audit
- [ ] Performance optimization pass
- [ ] Feature roadmap review

---

## Test Documents Checklist

Create and maintain these test files:

- [ ] `basic.md` - Simple headings, paragraphs, lists
- [ ] `code.md` - Code blocks with syntax highlighting
- [ ] `tables.md` - Complex tables
- [ ] `math.md` - LaTeX equations (KaTeX test)
- [ ] `mermaid.md` - Mermaid diagrams (all types)
- [ ] `emoji.md` - Emoji rendering
- [ ] `frontmatter.md` - YAML front matter
- [ ] `includes.md` - File includes
- [ ] `long-document.md` - 50+ pages (pagination test)

**For each test document:**
- [ ] PDF export works
- [ ] HTML export works
- [ ] Output matches expected result
- [ ] No console errors

---

## Success Metrics

### Functional (Phase 1 Complete)

- [ ] PDF export works for all test documents
- [ ] HTML export works for all test documents
- [ ] Mermaid diagrams render correctly
- [ ] Math/KaTeX renders correctly
- [ ] No console errors in VSCode developer tools
- [ ] Zero security vulnerabilities (`npm audit`)

### Quality (Phase 2 Complete)

- [ ] 80%+ test coverage
- [ ] Zero ESLint errors
- [ ] Zero TypeScript errors
- [ ] All dependencies up-to-date
- [ ] No known security vulnerabilities

### User Experience (Phase 3 Complete)

- [ ] Extension loads in < 1 second
- [ ] PDF export completes in < 5 seconds (typical doc)
- [ ] Settings UI is clean and understandable
- [ ] Documentation answers common questions
- [ ] Dark mode works correctly
- [ ] Accessibility passes WCAG AA

### Adoption (3 Months Post-Launch)

- [ ] 100+ active users
- [ ] 4.5+ star rating
- [ ] < 5 open issues (vs 256 in original)
- [ ] Active community engagement
- [ ] Positive reviews

---

## Notes

### Decisions Made

1. **PlantUML removed** - Privacy/offline positioning, 75% of issues unresolved
2. **PNG/JPEG removed** - Focus on PDF/HTML, reduce code by ~15%
3. **Mermaid bundled locally** - Inlined from `node_modules`, no CDN, fully offline
4. **KaTeX over MathJax** - Smaller bundle, faster rendering, better VSCode integration
5. **KaTeX plugin written inline** - Avoids `markdown-it-katex` (XSS CVE) and `@iktakahiro/markdown-it-katex` (bundles vulnerable katex); uses our audited `katex@0.16.37`
6. **markdown-it-anchor replaces markdown-it-named-headers** - Named-headers depended on `string` package (ReDoS CVE, no fix)
7. **installChromium() removed** - Used `createBrowserFetcher` API removed in puppeteer v20+; extension now detects system Chrome
8. **TypeScript** - Type safety, better IDE support, easier maintenance (Phase 2)
9. **esbuild** - Fast builds, simple configuration, small bundles (Phase 2)
10. **Privacy-first** - No external servers, no telemetry, no CDN dependencies

### Open Questions

1. Extension name: `Markdown PDF (Revived)` or different?
2. Publisher name: Use personal GitHub account or organization?
3. Icon/banner: Design custom or use modified original?

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Upstream remains unmaintained | High | Medium | Fork is independent |
| Breaking changes from updates | Medium | Medium | Thorough testing |
| User backlash (removed features) | Low | Low | Clear communication |
| Security vulnerabilities persist | Low | High | Regular audits |
| Mermaid still broken after PR #365 | Low | Medium | Test thoroughly |

---

**Last Updated:** 7 March 2026
**Next Action:** Phase 2.1 — TypeScript setup and esbuild build system (manual VSCode tests can run in parallel)
