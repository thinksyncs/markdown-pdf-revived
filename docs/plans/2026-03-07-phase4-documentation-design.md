# Phase 4 Documentation Design
**Date:** 2026-03-07
**Scope:** README rewrite, MIGRATION.md, CHANGELOG.md, package.json metadata
**Out of scope:** Visual assets, marketplace publishing (requires manual testing first)

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Extension name | `Markdown PDF` | Name the thing, not the story |
| Package ID | `markdown-pdf` | Clean, discoverable, matches what users search |
| Publisher | `AUAggy` | Replace `yzane` |
| Version | `2.0.0` | Breaking changes: removed features, changed defaults, TypeScript rewrite |
| README tone | Direct technical with personality | Per DeSlop extension style + anti-ai-slop guidelines |
| Writing rules | docs/anti-ai-slop.md | No em-dashes, no buzzwords, no padding phrases, active voice |

---

## README Structure

```
# Markdown PDF

<one-line pitch>

## Requirements
<Chrome upfront — not buried — this is the #1 install failure>

## What Changed in v2
<honest: original abandoned, 256 issues, here's what we fixed/removed>

## Usage
<command palette, right-click, auto-save — imperative mood>

## Features
<facts: syntax highlight, emoji, math, mermaid, includes, containers, checkboxes>

## Settings
<grouped table: 21 settings, defaults, descriptions>

## Mermaid (replaces PlantUML)
<migration table, link to mermaid docs>

## Known Limitations
<honest: Chrome required, no PNG/JPEG, online CSS unreliable>

## Credits
<upstream + all libraries>

## License
```

### Tone Rules
- Active voice, imperative for instructions
- No em-dashes (anti-ai-slop rule)
- No: leverage, seamless, robust, enhance, optimize, streamline, revolutionize
- No padding: "it's worth noting", "importantly", "essentially"
- No: "This isn't X, it's Y", "Say goodbye to X"
- Present tense for stable features, past tense for historical (original extension)
- No first-person or second-person outside direct instructions

---

## CHANGELOG.md Structure

Keep a Changelog format (https://keepachangelog.com).

```
# Changelog

## [2.0.0] - 2026-03-07

### Added
- KaTeX math rendering ($...$ inline, $$...$$ display)
- DOMPurify HTML sanitization (CVE-2024-7739)
- Mermaid async render wait before PDF capture
- TypeScript source with strict mode
- esbuild bundle pipeline
- Cross-platform Chrome auto-detection

### Changed
- Puppeteer: 2.1.1 -> 24.x (system Chrome, no bundled Chromium)
- All dependencies updated to current versions
- Default highlightStyle: github.css
- Default margins: 2cm top/bottom, 2.5cm left/right
- displayHeaderFooter default: false
- markdown-it-anchor replaces markdown-it-named-headers (ReDoS CVE)
- Settings reduced from ~30 to 21

### Removed
- PlantUML (sent diagrams to external server)
- PNG/JPEG export
- Chromium auto-download
- Settings: scale, pageRanges, width, height, includeDefaultStyles,
  stylesRelativePathFile, outputDirectoryRelativePathFile,
  StatusbarMessageTimeout, debug, markdown-it-include.enable

### Fixed
- Mermaid diagrams in PDF (Chromium 80 -> current; async render wait)
- KaTeX single-line display math ($$formula$$ on one line)

### Security
- Patched CVE-2024-7739 (XSS via unsanitized markdown HTML blocks)
- npm audit --omit=dev: 0 vulnerabilities
```

---

## MIGRATION.md Structure

Target audience: users of `yzane.markdown-pdf` upgrading to `AUAggy.markdown-pdf`.

```
# Migrating from yzane.markdown-pdf

## Breaking Changes
<removed features, changed defaults, removed settings>

## PlantUML to Mermaid
<conversion table>

## Removed Settings
<table: old setting -> what to do now>

## Changed Defaults
<table: setting, old default, new default>
```

---

## package.json Metadata Changes

| Field | Old | New |
|---|---|---|
| `name` | `markdown-pdf` | `markdown-pdf` |
| `displayName` | `Markdown PDF` | `Markdown PDF` |
| `publisher` | `yzane` | `AUAggy` |
| `version` | `1.5.0` | `2.0.0` |
| `description` | `Convert Markdown to PDF` | `Markdown to PDF/HTML converter. Local rendering, no external servers, Chrome required.` |
| `keywords` | (check current) | `markdown, pdf, html, mermaid, katex, offline, privacy` |
| `categories` | (check current) | `["Other"]` |
| `author` | missing | `AUAggy` |
| `repository` | original yzane repo | fork URL |

---

## Implementation Order

1. package.json metadata (quick, unblocks everything else)
2. CHANGELOG.md (facts-only, no creativity needed)
3. MIGRATION.md (structured, factual)
4. README.md (most creative, do last with full context)
5. Commit all on feature/phase-3-cleanup branch
