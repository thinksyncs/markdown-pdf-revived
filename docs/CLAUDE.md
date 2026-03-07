# Claude Instructions

**Purpose:** Track development sessions, completed work, and next steps for Markdown PDF (Revived)

---

## Project Overview

**Repo:** https://github.com/AUAggy/markdown-pdf-revived
**Original:** https://github.com/yzane/vscode-markdown-pdf
**Branch strategy:** Each phase gets a dedicated `feature/phase-X-Y-description` branch. Docs are committed on the feature branch and cherry-picked to `revived-main`. Phase branches are not merged until testing is complete.
**Tagline:** "A privacy-first, offline-capable Markdown to PDF converter for VSCode"

### Key Files
- `extension.js` — Main extension code (~960 lines, monolith — Phase 2 will modularise to TypeScript)
- `package.json` — Dependencies and VSCode contribution points
- `README.md` — User-facing documentation
- `docs/CLAUDE.md` — This file: session log and project context
- `docs/todo.md` — Granular implementation checklist
- `docs/MODERNIZATION_PLAN.md` — Full architecture and strategy document

### Core Positioning
- **Privacy-first** — No external servers, no telemetry, no CDN calls
- **Offline-capable** — All rendering (Mermaid, KaTeX, syntax highlight) happens locally
- **Lean** — PDF/HTML only; PNG/JPEG and PlantUML removed
- **Secure** — DOMPurify sanitization, 0 production CVEs
- **Modern** — All dependencies at latest; TypeScript refactor in Phase 2

---

## Session Log

### Session 1: 7 March 2026 — Setup & Phase 1.2 (PlantUML Removal)

**Status:** Complete

#### Accomplished
1. Forked repository to https://github.com/AUAggy/markdown-pdf-revived
2. Created `revived-main` branch; configured git remotes and identity
3. Stripped all `Co-authored-by: Qwen-Coder` attribution from commit history; force-pushed clean history
4. **Phase 1.2: Remove PlantUML**
   - Removed PlantUML plugin from `extension.js` (lines 269-276)
   - Removed `markdown-it-plantuml` dependency from `package.json`
   - Removed 3 settings: `plantumlOpenMarker`, `plantumlCloseMarker`, `plantumlServer`
   - Removed `images/PlantUML.png`
   - Updated `README.md`: removed PlantUML section, added Mermaid migration guide
5. Created `docs/` folder with `MODERNIZATION_PLAN.md`, `todo.md`, `CLAUDE.md`

#### Commits
```
9f00b5e feat: remove PlantUML for privacy-first, offline positioning
cf7fb81 docs: add project tracking documentation
```

#### Issues Encountered
- Git auto-adding `Co-authored-by` trailer — stripped via `git commit --amend`
- macOS trash permission on PlantUML.png — used `rm` directly

---

### Session 2: 7 March 2026 — Phases 1.3, 1.4, 1.5, 1.6

**Status:** Phase 1.6 in progress

#### Phase 1.3: Remove PNG/JPEG Export

**Branch:** `feature/phase-1-3-remove-png-jpeg`

- Removed PNG/JPEG screenshot block from `exportPdf()` in `extension.js`
- Removed `png`/`jpeg` from `types_format` array — now `['html', 'pdf']`
- Removed command registrations, `activationEvents`, command definitions, and all menu entries
- Removed 6 settings: `quality`, `clip.x/y/width/height`, `omitBackground`
- Updated "Export all" title to `all: pdf, html`
- Documented `mermaidServer` CDN issue in `MODERNIZATION_PLAN.md` with 4 options for resolution
- **Missed item (caught in 1.6):** PNG/JPEG entries still present in `commandPalette` `when` block — fixed in Phase 1.6

**Commit:** `3658ac2 feat: remove PNG/JPEG export for lean PDF/HTML focus (Phase 1.3)`

---

#### Phase 1.4: Update All Dependencies + Community PRs

**Branch:** `feature/phase-1-4-update-dependencies`

**Puppeteer v24 migration (addresses PR #365):**
- `puppeteer-core`: 2.1.1 → 24.38.0 — fixes Mermaid (old Chromium v80 lacked `structuredClone`)
- Removed `installChromium()` — used `createBrowserFetcher` API removed in v20+
- Added `getChromiumDefaultPaths()` — cross-platform Chrome detection (macOS/Linux/Windows)
- Refactored `checkPuppeteerBinary()` and `exportPdf()` launch for v24 API
- `init()` shows clear error if Chrome is not found

**KaTeX math (addresses PR #386):**
- Added `katex: ^0.16.37`
- Added `markdown-pdf.math` setting (boolean, default `true`)
- Wrote self-contained `markdownItKaTeX()` plugin inline in `extension.js`
  - Avoids `markdown-it-katex` (XSS CVE, no fix) and `@iktakahiro/markdown-it-katex` (bundles old vulnerable katex)
  - Supports `$...$` inline and `$$...$$` display math
- KaTeX CSS linked via absolute `file://` path so fonts resolve correctly in Puppeteer

**Local Mermaid bundling (resolves CDN issue from 1.3):**
- Added `mermaid: ^11.12.3`
- Removed `markdown-pdf.mermaidServer` setting
- `makeHtml()` now inlines Mermaid from `node_modules/mermaid/dist/mermaid.min.js` — offline, no CDN

**Replaced vulnerable packages:**
- `markdown-it-named-headers` → `markdown-it-anchor: ^9.2.0` (upstream depended on `string` package with ReDoS CVE, no fix)
- Removed `markdown-it-katex` (XSS CVE, no fix)
- `vscode-test` → `@vscode/test-electron: ^2.5.2`

**All dependencies updated to latest:**
- `markdown-it` 10→14, `highlight.js` 9→11, `cheerio` 0.20→1.0, `markdown-it-emoji` 1→3
- `markdown-it-container` 2→4, `markdown-it-include` 1→2, `mustache` 4.0→4.2
- `mkdirp` 1→3, `rimraf` 3→6, `gray-matter` 4.0.2→4.0.3
- `glob` 7→13 (dev), `mocha` 7→11 (dev)
- VSCode engine: `^1.0.0` → `^1.85.0`

**PR #418:** Language setting already present in original code — retained as-is.
**PR #399:** Deferred to Phase 1.6 — identified as Mermaid async render timing issue.

**Security:** `npm audit --omit=dev` → 0 production vulnerabilities. 3 dev-only mocha vulns do not ship.

**Commits:**
```
40ec2be feat: update all dependencies and add KaTeX + local Mermaid (Phase 1.4)
5b99bf7 docs: update todo.md to reflect Phase 1.3 and 1.4 completion
```

---

#### Phase 1.5: CVE-2024-7739 — DOMPurify HTML Sanitization

**Branch:** `feature/phase-1-5-security-cve-2024-7739`

**Threat:** Malicious markdown containing `<script>` tags or inline event handlers could execute arbitrary JS in the Puppeteer Chrome context, potentially exfiltrating local files via `file://` access.

**Fix:** `sanitizeContent()` function added to `extension.js`:
- Uses `dompurify: ^3.3.2` + `jsdom: ^28.1.0` to provide DOM environment in Node.js
- Called on markdown-rendered content in `makeHtml()` before template injection
- Trusted internal assets (inlined Mermaid, KaTeX/hljs CSS) are NOT sanitized
- `ALLOW_DATA_ATTR: true` — preserves Mermaid `data-*` attributes
- `ADD_TAGS`: full MathML + SVG tag list — KaTeX output survives sanitization
- `FORBID_TAGS`: `script`, `iframe`, `object`, `embed`, `base`
- `FORBID_ATTR`: all `on*` event handlers
- **Fail-closed:** sanitization error blocks export entirely; user sees clear error message
- Call site in `markdownPdf()` guards against null return from `makeHtml()`

**npm audit --omit=dev:** still 0 production vulnerabilities.

**Commit:** `9eadb10 fix: patch CVE-2024-7739 with DOMPurify HTML sanitization (Phase 1.5)`

---

#### Phase 1.6: Verification Pass (current)

**Branch:** `feature/phase-1-6-verification`

**Static code audits (all pass):**
- PlantUML: 0 references in extension.js or package.json
- PNG/JPEG export code: 0 references
- `mermaidServer`: 0 references
- `installChromium`/`createBrowserFetcher`: 0 references
- `sanitizeContent`: present (3 refs)
- `markdownItKaTeX`: present (2 refs)
- `mermaid.min.js` inline: present (1 ref)
- `waitForFunction` (PR #399 fix): present (1 ref)
- `npm audit --omit=dev`: 0 vulnerabilities

**Missed items from Phase 1.3 — fixed in 1.6:**
- PNG/JPEG `when` conditions still present in `commandPalette` block — removed
- Stale comment "convert and export markdown to pdf, html, png, jpeg" — updated

**PR #399 fix implemented:**
- Root cause: `waitUntil: 'networkidle0'` doesn't wait for Mermaid's async SVG rendering
- HTML export (interactive browser) showed diagrams; PDF captured them as raw text mid-render
- Fix: after `page.goto()`, check for `.mermaid` elements and `waitForFunction()` until all have `data-processed` attribute (Mermaid sets this when done), with 10s timeout and graceful fallback

**Test documents created** in `test-docs/`:
- `basic.md` — headings, paragraphs, lists, task lists, blockquotes, inline HTML
- `code.md` — syntax highlighting across JS, TS, Python, shell, JSON
- `tables.md` — simple, aligned, wide, and formatted tables
- `math.md` — KaTeX inline and display math
- `mermaid.md` — flowchart, sequence, class, gantt, state diagrams
- `security-xss.md` — XSS payload test (all should be stripped by DOMPurify)

---

### Session 3: 7 March 2026 — KaTeX Block Math Fix

**Status:** Complete

#### Accomplished
1. **Fixed `markdownItKaTeX` block rule** in `extension.js`
   - Root cause: all display math in `math.md` uses single-line `$$formula$$`; the block rule only handled multi-line format (opening `$$` on one line, closing `$$` on a subsequent line)
   - Node test confirmed: both single-line and multi-line failed to match before fix
   - Rewrote block rule to detect closing `$$` on the same line first (single-line path), then fall through to multi-line search
   - Node test confirmed both cases pass after fix
2. **Fixed `tables.md`** — replaced confusing backtick-wrapped `$...$` literal in KaTeX row with plain description text
3. Updated `docs/todo.md` and `docs/CLAUDE.md`

#### Key Insight
The block rule had `if (max - pos < 4 ...)` guard (minimum `$$x$$` is 6 chars but `$$$$` is 4), and the single-line close detection uses `lineContent.indexOf('$$')` on the content after the opening `$$`.

---

### Session 4: 7 March 2026 — Phase 2: TypeScript Migration

**Status:** Complete

#### Accomplished
1. **Phase 2.1 + 2.2:** TypeScript + esbuild build pipeline
   - `typescript ^5.9.3`, `esbuild ^0.27.3`, `@types/node`, `@types/vscode`
   - `tsconfig.json` — strict mode, ES2020, rootDir `src/`, outDir `dist/`
   - `esbuild.js` — bundles `src/extension.ts` → `dist/extension.js`; all heavy deps external
   - `npm run build` / `watch` / `vscode:prepublish` scripts added
   - `package.json` `main` updated to `./dist/extension`
   - Phase 2.1 bridge (`src/extension.ts` → `require('../extension')`) to validate pipeline
   - Fix: `../extension` must be esbuild external so its `__dirname` stays at project root (not `dist/`)

2. **Phase 2.5–2.7:** Full TypeScript migration — `extension.js` → typed modules
   - `src/types.ts`, `src/config/settings.ts` (EXTENSION_ROOT), `src/utils/logger.ts`, `src/utils/file.ts`
   - `src/converter/` — slug.ts, katex.ts, sanitize.ts, markdown.ts
   - `src/template/page.ts` — makeHtml, readStyles, getOutputDir, fixHref
   - `src/exporter/html.ts`, `src/exporter/pdf.ts`
   - `src/extension.ts` — activate/deactivate, command registration
   - EXTENSION_ROOT pattern: `path.join(__dirname, '..')` — all asset paths resolved correctly
   - `chromiumReady` flag encapsulated in pdf.ts via `markChromiumReady()`
   - `tsc --noEmit` → 0 errors; `npm run build` → complete

3. **Phase 2.8:** Verification
   - Manual testing in VSCodium: basic, math, mermaid — all pass, no console errors
   - `npm audit --omit=dev` → 0 vulnerabilities
   - Phases 2.3 (ESLint) and 2.4 (Jest) deferred to post-Phase 3

#### Key Architectural Decisions
| Decision | Rationale |
|----------|-----------|
| `EXTENSION_ROOT = path.join(__dirname, '..')` | `__dirname` in esbuild bundle = `dist/`; all assets live at project root |
| All heavy deps kept external in esbuild | Avoids bundling ~5MB; runtime `require()` from `node_modules` |
| `chromiumReady` encapsulated in pdf.ts | No global mutable state leaking across modules |
| `extension.js` kept at root | Not deleted yet — acts as reference during cleanup phase |

---

### Session 5: 7 March 2026 — Phase 3 Cleanup + Phase 4 Documentation

**Status:** Complete

#### Accomplished

1. **Phase 3.1: Settings simplification** — 30 → 21 settings. Removed: `scale`, `pageRanges`, `width`, `height`, `includeDefaultStyles`, `stylesRelativePathFile`, `outputDirectoryRelativePathFile`, `StatusbarMessageTimeout`, `debug`, `markdown-it-include.enable`
2. **Phase 3.2: Modernized defaults** — `highlightStyle`: `github.css`; `displayHeaderFooter`: `false`; margins: 2cm top/bottom, 2.5cm left/right
3. **Phase 3.3: Rewrote CSS** — Replaced VSCode editor stylesheet with print-focused typography. `markdown.css`: system font stack, 1.7 line height, 15px base, heading separators, task list alignment, blockquote border. `markdown-pdf.css`: code block styling, Mermaid centering, KaTeX overflow, multi-page table headers, striped rows, `@media print` rules
4. **Phase 3.4: Accessibility** — Added `lang="en"`, `<main>` landmark, `<meta charset>` and `<meta name="viewport">`. WCAG AA audit: all 9 color pairs pass (minimum 4.83:1 for `del` text at `#6b7280`)
5. **Phase 3.5: Template update** (completed during 3.4) — Removed stale `.vscode-dark`/`.vscode-high-contrast` Mermaid theme detection. Escaped title with `{{title}}` (was `{{{title}}}`) for XSS-safe filename in `<title>`
6. **Phase 3.6: Verification** — `npm run build`: 0 errors; `tsc --noEmit`: 0 errors; `npm audit --omit=dev`: 0 vulnerabilities; 21 settings confirmed; HTML5 template valid; 0 CDN references
7. **Phase 4.4: package.json metadata** — `publisher: AUAggy`, `version: 2.0.0`, description updated, keywords updated, repository URL updated
8. **Phase 4.3: CHANGELOG.md** — Written in Keep a Changelog format; v2.0.0 entry covers Added, Changed, Removed, Fixed sections
9. **Phase 4.2: MIGRATION.md** — Written for yzane → AUAggy upgraders; covers breaking changes, removed features, setting changes, Mermaid conversion examples, FAQ
10. **Phase 4.1: README.md** — Fully rewritten. Anti-slop review by subagent. Quality review by subagent.

#### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Extension name: "Markdown PDF" (no "(Revived)" suffix) | Name the product, not its history. Feynman principle: name what it is, not where it came from |
| All documentation under docs/anti-ai-slop.md rules | Concrete nouns, active verbs, no hedging, no filler phrases |
| Subagent-driven development for Phase 4 docs | Parallelise doc writing; each subagent gets fresh context for quality review |

---

## Project Status Dashboard

| Phase | Status | Branch |
|-------|--------|--------|
| 1.1 Repository Setup | Complete | revived-main |
| 1.2 Remove PlantUML | Complete | revived-main |
| 1.3 Remove PNG/JPEG | Complete | feature/phase-1-3 |
| 1.4 Update Dependencies + PRs | Complete | feature/phase-1-4 |
| 1.5 Fix CVE-2024-7739 | Complete | feature/phase-1-5 |
| 1.6 Verification | Complete | feature/phase-1-6 |
| 2.1+2.2 TypeScript + esbuild | Complete | feature/phase-2-1-typescript-setup |
| 2.3 ESLint + Prettier | Deferred | — |
| 2.4 Jest testing | Deferred | — |
| 2.5–2.7 TypeScript Migration | Complete | feature/phase-2-5-typescript-migration |
| 2.8 Phase 2 Verification | Complete | feature/phase-2-5-typescript-migration |
| 3.1–3.6 Feature Cleanup | Complete | feature/phase-3-cleanup |
| 4.1 README | Complete | feature/phase-3-cleanup |
| 4.2 Migration Guide | Complete | feature/phase-3-cleanup |
| 4.3 Changelog | Complete | feature/phase-3-cleanup |
| 4.4 Package Metadata | Complete | feature/phase-3-cleanup |
| 4.5 Visual Assets | Complete | feature/phase-3-cleanup |
| 4.5b esbuild bundling / size reduction | Complete | feature/phase-3-cleanup |
| 4.5c Community issue fixes (8 issues) | Complete | feature/phase-3-cleanup |
| 4.6 Final Testing | In Progress | — |
| 4.7–4.10 Package/Publish/Announce | Not Started | — |

---

## Architectural Decisions Log

| Decision | Rationale |
|----------|-----------|
| PlantUML removed | Sends diagrams to external server; 75% of its issues unresolved; offline broken |
| PNG/JPEG removed | Lean focus on PDF/HTML; 15% code reduction; 6 settings eliminated |
| Mermaid bundled locally | Inlined from node_modules; was previously loading from unpkg.com CDN |
| KaTeX (not MathJax) | ~200KB vs ~2MB; sync rendering; no external calls |
| Custom KaTeX plugin | `markdown-it-katex` has XSS CVE; `@iktakahiro/markdown-it-katex` bundles vulnerable katex |
| markdown-it-anchor | Replaces `markdown-it-named-headers` which depended on `string` (ReDoS CVE, no fix) |
| DOMPurify fail-closed | Security failure should block export, not silently pass unsanitized content |
| installChromium removed | `createBrowserFetcher` removed in puppeteer v20+; extension now detects system Chrome |
| Feature branches per phase | Isolates changes; allows review before merging to revived-main |

---

## What to Watch Out For

- Always create Phase N+1 branch from Phase N feature branch (not from `revived-main`), since revived-main may be behind
- `npm audit --omit=dev` is the correct command — `npm audit` flags dev-only mocha vulns that don't ship
- Mermaid inlining adds ~2MB to every HTML output — acceptable for offline/privacy; may revisit in Phase 3
- KaTeX CSS must be `<link>`-tagged (not inlined) so that relative font paths resolve in Puppeteer
- DOMPurify ADD_TAGS list must be kept in sync if new rendering libraries are added

---

---

### Session 6: 7 March 2026 — esbuild Bundling Fix (Package Size Reduction)

**Status:** Complete

#### Problem
The .vsix was 60MB because esbuild.js marked all 18 production deps as `external`, causing the full `node_modules/` to ship with the extension.

#### Solution
- **esbuild.js**: Removed all pure-JS deps from `external` list. Now only `vscode`, `puppeteer-core`, and `canvas` (optional native jsdom addon) are external.
- **.vscodeignore**: Added `node_modules/**` to exclude all of node_modules, then used negation patterns to re-include only runtime file assets:
  - `!node_modules/puppeteer-core/**` and its transitive deps (chromium-bidi, devtools-protocol, tldts, zod, @puppeteer/*)
  - `!node_modules/mermaid/dist/mermaid.min.js`
  - `!node_modules/katex/dist/katex.min.css` and `!node_modules/katex/dist/fonts/**`
  - `!node_modules/highlight.js/styles/**`
  - `!node_modules/emoji-images/pngs/**`

#### Result
- dist/extension.js: 13.1MB (all pure-JS deps bundled in)
- .vsix: ~16MB (down from 60MB; 73% reduction)
- puppeteer-core + chromium-bidi account for ~20MB uncompressed (unavoidable — runtime launcher)

#### Notes
- esbuild warning about `xhr-sync-worker.js` in jsdom is harmless — that code path (sync XHR) is never triggered
- `--no-dependencies` flag to vsce must NOT be used — it bypasses the `.vscodeignore` negation patterns
- README.md and CHANGELOG.md updated to reflect the size reduction

---

---

### Session 7: 7 March 2026 — Community Issue Fixes (8 issues)

**Status:** Complete

#### Issues Fixed

| Issue | Fix | Commit |
|---|---|---|
| #103 Inline code colour washed out | CSS rules in markdown.css | `949a9d9` |
| #193 Frontmatter title not in header | `ConvertResult` interface; thread title to `<title>` | `71a711b` |
| #210 Date format in header | Already working via `%%ISO-DATE%%` token | — |
| #126 Relative CSS paths fail | `resolveStylePath()` helper: .md dir first, workspace root fallback | `d25fb8f` |
| #75 User CSS not in header/footer | `readUserStylesAsText()` + prepend `<style>` block to templates | `1d27d8b` |
| #131 No footnote support | `markdown-it-footnote` plugin + CSS | `8c5a494` |
| #364 GitHub callout blocks | Post-render cheerio transform + CSS | `c4b452a` |
| #189 Navigation timeout on large docs | `markdown-pdf.timeout` setting (default 60000ms) | `66a3e3a` |

#### Architecture Notes
- `ConvertResult` interface exported from `src/converter/markdown.ts` — callers now use `.html` and `.title`
- `resolveStylePath()` exported from `src/template/page.ts` — shared by `readStyles()` and `readUserStylesAsText()`
- `transformCallouts()` runs as a post-render HTML transform (cheerio); keeps `<blockquote>` element, adds class and `data-callout`
- Empty-string and whitespace-only frontmatter titles fall back to filename (`.trim() !== ''` guard)
- `markdown-pdf.timeout` replaces all three hardcoded timeouts in pdf.ts: `page.goto()`, `page.waitForFunction()`, `page.pdf()`

#### Quality Gates (per task)
- Each task: spec compliance review + code quality review by fresh subagents
- Issues caught in review: empty-string title edge case (#193), misleading comment in callout transform (#364), redundant `pre > code` rule (#103)

---

**Last Updated:** 7 March 2026
**Current Phase:** 4.6 — Manual testing on second workstation
**Next Phase:** 4.7–4.10 — Package, publish, announce
