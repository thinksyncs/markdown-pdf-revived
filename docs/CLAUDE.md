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

## Project Status Dashboard

| Phase | Status | Branch |
|-------|--------|--------|
| 1.1 Repository Setup | Complete | revived-main |
| 1.2 Remove PlantUML | Complete | revived-main |
| 1.3 Remove PNG/JPEG | Complete | feature/phase-1-3 |
| 1.4 Update Dependencies + PRs | Complete | feature/phase-1-4 |
| 1.5 Fix CVE-2024-7739 | Complete | feature/phase-1-5 |
| 1.6 Verification | In Progress | feature/phase-1-6 |
| 2.1–2.8 Architecture (TypeScript) | Not Started | — |
| 3.1–3.6 Feature Cleanup | Not Started | — |
| 4.1–4.9 Documentation & Release | Not Started | — |

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

**Last Updated:** 7 March 2026
**Current Phase:** Phase 1 Complete
**Next Phase:** 2.1 — TypeScript setup and esbuild build system
