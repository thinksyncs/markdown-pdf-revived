# Phase 4 Documentation & Metadata Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite README, write CHANGELOG and MIGRATION docs, update package.json metadata — all following docs/anti-ai-slop.md writing rules strictly.

**Architecture:** Documentation-only phase. No code changes. Four files touched: `package.json`, `README.md`, `CHANGELOG.md`, `MIGRATION.md`. All on `feature/phase-3-cleanup` branch. Single commit per file.

**Tech Stack:** Markdown, Keep a Changelog format, VSCode extension manifest (package.json).

**Writing rules (non-negotiable):** See `docs/anti-ai-slop.md`. Key constraints: no em-dashes, no banned buzzwords (leverage/seamless/robust/enhance/optimize/streamline/revolutionize), no padding phrases ("it's worth noting", "importantly"), active voice, imperative for instructions, no first/second person outside direct instructions, no exclamation points.

**Reference:** `docs/plans/2026-03-07-phase4-documentation-design.md` for all structural decisions.

---

### Task 1: Update package.json metadata

**Files:**
- Modify: `package.json` (top-level fields only — do not touch `contributes`)

**Step 1: Make all metadata changes in one edit**

Change these fields:

```json
{
  "name": "markdown-pdf",
  "displayName": "Markdown PDF",
  "description": "Markdown to PDF/HTML converter. Local rendering, no external servers, Chrome required.",
  "version": "2.0.0",
  "publisher": "AUAggy",
  "author": "AUAggy",
  "keywords": [
    "markdown",
    "pdf",
    "html",
    "mermaid",
    "katex",
    "offline",
    "privacy"
  ],
  "categories": [
    "Other"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/AUAggy/markdown-pdf-revived"
  }
}
```

Also update `"icon"` field if present — set to `"images/icon.png"` (placeholder, will be created in 4.5).

**Step 2: Verify build still passes**

```bash
npm run build
```
Expected: `esbuild: build complete`

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: update package metadata for v2.0.0 release (Phase 4.4)"
```

---

### Task 2: Write CHANGELOG.md

**Files:**
- Create: `CHANGELOG.md` (project root)

**Step 1: Write the file**

```markdown
# Changelog

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning: [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-03-07

This release takes over from `yzane.markdown-pdf`, which has had no maintainer
activity since late 2023 (256 open issues, 35+ open PRs). The focus is privacy,
offline capability, and a reduced feature set that works correctly.

### Added
- KaTeX math rendering: `$...$` inline, `$$...$$` display
- DOMPurify HTML sanitization — patches CVE-2024-7739
- Mermaid render wait before PDF capture (fixes diagrams rendering as raw text)
- TypeScript source with strict mode enabled
- esbuild bundle pipeline (`src/` -> `dist/extension.js`)
- Cross-platform Chrome auto-detection (macOS, Linux, Windows)
- `github.css` syntax highlight theme as default

### Changed
- puppeteer-core: 2.1.1 -> 24.x — uses system Chrome, no bundled Chromium
- All dependencies updated to current versions; 0 production CVEs
- Default margins: 2cm top/bottom, 2.5cm left/right (was 1.5cm/1cm/1cm/1cm)
- `displayHeaderFooter` default: `false` (was `true`)
- `markdown-it-anchor` replaces `markdown-it-named-headers` (ReDoS CVE in upstream)
- Settings count: ~30 -> 21

### Removed
- PlantUML support — sent diagram source to `plantuml.com`; use Mermaid instead
- PNG/JPEG export
- Chromium auto-download (`createBrowserFetcher` removed in puppeteer v20)
- Settings: `scale`, `pageRanges`, `width`, `height`, `includeDefaultStyles`,
  `stylesRelativePathFile`, `outputDirectoryRelativePathFile`,
  `StatusbarMessageTimeout`, `debug`, `markdown-it-include.enable`

### Fixed
- Mermaid diagrams in PDF (Chromium 80 -> current; added async render wait)
- KaTeX single-line display math: `$$formula$$` on one line was not matched

### Security
- CVE-2024-7739: XSS via unsanitized HTML in markdown — fixed with DOMPurify
- `npm audit --omit=dev`: 0 vulnerabilities
```

**Step 2: Verify the file renders correctly**

Open `CHANGELOG.md` in VSCode preview and confirm all sections are present.

**Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: write CHANGELOG.md for v2.0.0 (Phase 4.3)"
```

---

### Task 3: Write MIGRATION.md

**Files:**
- Create: `MIGRATION.md` (project root)

**Step 1: Write the file**

```markdown
# Migrating from yzane.markdown-pdf

This guide covers the changes between the original `yzane.markdown-pdf` extension
and `AUAggy.markdown-pdf` v2.0.0.

## Removed Features

| Feature | Status | Alternative |
|---|---|---|
| PlantUML diagrams | Removed | Use Mermaid (see below) |
| PNG export | Removed | PDF/HTML only |
| JPEG export | Removed | PDF/HTML only |
| Chromium auto-download | Removed | Install Chrome/Chromium manually |

## Removed Settings

These settings no longer exist. Remove them from your `settings.json`.

| Setting | Replacement |
|---|---|
| `markdown-pdf.scale` | Not configurable (fixed at 1) |
| `markdown-pdf.pageRanges` | Not configurable (always all pages) |
| `markdown-pdf.width` | Use `markdown-pdf.format` instead |
| `markdown-pdf.height` | Use `markdown-pdf.format` instead |
| `markdown-pdf.includeDefaultStyles` | Always enabled |
| `markdown-pdf.stylesRelativePathFile` | Removed; relative paths resolve from workspace root |
| `markdown-pdf.outputDirectoryRelativePathFile` | Removed; relative paths resolve from workspace root |
| `markdown-pdf.StatusbarMessageTimeout` | Not configurable (fixed at 10s) |
| `markdown-pdf.debug` | Not configurable |
| `markdown-pdf.markdown-it-include.enable` | Always enabled |

## Changed Defaults

| Setting | Old Default | New Default |
|---|---|---|
| `markdown-pdf.highlightStyle` | `""` (tomorrow.css) | `"github.css"` |
| `markdown-pdf.displayHeaderFooter` | `true` | `false` |
| `markdown-pdf.margin.top` | `1.5cm` | `2cm` |
| `markdown-pdf.margin.bottom` | `1cm` | `2cm` |
| `markdown-pdf.margin.right` | `1cm` | `2.5cm` |
| `markdown-pdf.margin.left` | `1cm` | `2.5cm` |

## PlantUML to Mermaid

PlantUML has been removed. All diagram source was sent to `plantuml.com` on each
render — a privacy issue and a hard dependency on external infrastructure.

Mermaid covers the same diagram types and renders locally.

| Diagram Type | PlantUML | Mermaid |
|---|---|---|
| Sequence | `@startuml`<br>`Alice -> Bob: Hello`<br>`@enduml` | ` ```mermaid`<br>`sequenceDiagram`<br>`Alice->>Bob: Hello`<br>` ``` ` |
| Flowchart | `@startuml`<br>`start`<br>`:step;`<br>`stop`<br>`@enduml` | ` ```mermaid`<br>`flowchart TD`<br>`A[Start] --> B[Step]`<br>` ``` ` |
| State | `@startuml`<br>`[*] --> State1`<br>`@enduml` | ` ```mermaid`<br>`stateDiagram`<br>`[*] --> State1`<br>` ``` ` |
| Class | `@startuml`<br>`class User`<br>`@enduml` | ` ```mermaid`<br>`classDiagram`<br>`class User`<br>` ``` ` |
| Gantt | `@startuml`<br>`gantt`<br>`@enduml` | ` ```mermaid`<br>`gantt`<br>`title Project`<br>` ``` ` |

Full Mermaid syntax: https://mermaid.js.org/

## Chrome Requirement

The original extension tried to download Chromium automatically. That API was
removed in puppeteer v20. This extension detects system Chrome automatically on
macOS, Linux, and Windows in standard installation paths.

If Chrome is not found at startup, an error message appears with instructions.
To specify a custom path:

```json
"markdown-pdf.executablePath": "/path/to/chrome"
```
```

**Step 2: Commit**

```bash
git add MIGRATION.md
git commit -m "docs: write MIGRATION.md for users upgrading from yzane.markdown-pdf (Phase 4.2)"
```

---

### Task 4: Rewrite README.md

**Files:**
- Modify: `README.md` (full rewrite)

**Step 1: Write the file**

This is the most creative task. Follow the structure from the design doc exactly.
Apply `docs/anti-ai-slop.md` rules throughout.

Key points:
- Open with one honest sentence, not a tagline
- "What Changed in v2" section up high — existing users need this first
- Requirements before features (Chrome is a hard dependency, not a footnote)
- Settings table grouped: Output, Styles, Markdown, PDF
- No em-dashes anywhere
- No exclamation points
- No: leverage, seamless, robust, enhance, optimize, streamline, revolutionize, empower
- No padding: "it's worth noting", "importantly", "essentially", "simply put"
- Present tense for current features, past tense for original extension history

Structure:
```
# Markdown PDF
<one sentence>

## Requirements
<Chrome — upfront>

## What Changed in v2
<honest diff from original: what broke, what was removed, what was fixed>

## Usage
<command palette — imperative>
<right-click menu>
<auto-save on convert>

## Features
<syntax highlight, emoji, math, mermaid, file includes, custom containers, checkboxes>

## Settings
<grouped table>

## Mermaid Diagrams
<replaces PlantUML, link to migration guide>

## Custom Containers
<markdown-it-container usage>

## File Includes
<markdown-it-include usage>

## Page Breaks
<.page div>

## Known Limitations
<honest: Chrome required, online CSS unreliable in PDF, no PNG/JPEG>

## Credits
<upstream + libraries>

## License
```

**Step 2: Self-review against anti-ai-slop.md**

After writing, scan every sentence for:
- Em-dashes (replace with colon, semicolon, or rewrite)
- Banned words (see docs/anti-ai-slop.md section A)
- Padding phrases (see docs/anti-ai-slop.md section B)
- Cliché formats (see docs/anti-ai-slop.md section C)
- Exclamation points (remove all)

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README.md for v2.0.0 (Phase 4.1)"
```

---

### Task 5: Update docs/todo.md and docs/CLAUDE.md

**Files:**
- Modify: `docs/todo.md`
- Modify: `docs/CLAUDE.md`

**Step 1: Mark Phase 4.1-4.4 complete in todo.md**

Update the status header to `Phase 4 Documentation Complete`.
Mark tasks 4.1, 4.2, 4.3, 4.4 as complete.
Leave 4.5 (visual assets), 4.6 (final testing), 4.7-4.10 (publish) as pending.

**Step 2: Add Session 5 entry to CLAUDE.md**

Add a session log entry covering:
- Phase 3 completion (3.1-3.6)
- Phase 4 documentation (4.1-4.4)
- Key decisions: Option A naming, publisher AUAggy, version 2.0.0
- Update project status dashboard

**Step 3: Commit**

```bash
git add docs/todo.md docs/CLAUDE.md
git commit -m "docs: update session log and todo for Phase 4 completion"
```

---

### Task 6: Final branch review

**Step 1: Verify all Phase 3+4 commits are on the branch**

```bash
git log --oneline feature/phase-3-cleanup
```

Expected commits (newest first):
- docs: update session log and todo for Phase 4 completion
- docs: rewrite README.md for v2.0.0
- docs: write MIGRATION.md
- docs: write CHANGELOG.md
- chore: update package metadata for v2.0.0
- docs: add Phase 4 documentation design plan
- docs: Phase 3 complete — update todo.md
- fix: accessibility improvements to template
- feat: rewrite CSS with modern print-focused typography
- feat: modernize default settings
- feat: simplify settings — remove 8 obsolete settings

**Step 2: Verify build is still clean**

```bash
npm run build && npx tsc --noEmit && npm audit --omit=dev
```

Expected: all pass, 0 vulnerabilities.

**Step 3: Ready for merge to revived-main**

Branch is ready for manual testing in VSCode before merging.
