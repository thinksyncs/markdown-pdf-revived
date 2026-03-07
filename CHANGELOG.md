# Changelog

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning: [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-03-07

This release takes over from `yzane.markdown-pdf`, which has had no maintainer
activity since late 2023 (256 open issues, 35+ open PRs). The focus is privacy,
offline capability, and a reduced feature set that works correctly.

### Added
- Footnote support via `markdown-it-footnote` (`[^1]` syntax)
  (closes [#131](https://github.com/yzane/vscode-markdown-pdf/issues/131))
- GitHub-style callout blocks: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!CAUTION]`
  (closes [#364](https://github.com/yzane/vscode-markdown-pdf/issues/364))
- `markdown-pdf.timeout` setting: configurable export timeout in milliseconds (default: 60000). Prevents navigation timeout errors on large documents
  (closes [#189](https://github.com/yzane/vscode-markdown-pdf/issues/189))
- KaTeX math rendering: `$...$` inline, `$$...$$` display
  (closes [#21](https://github.com/yzane/vscode-markdown-pdf/issues/21),
  [#276](https://github.com/yzane/vscode-markdown-pdf/issues/276),
  [#199](https://github.com/yzane/vscode-markdown-pdf/issues/199),
  [#167](https://github.com/yzane/vscode-markdown-pdf/issues/167))
- DOMPurify HTML sanitization: patches CVE-2024-7739
- Mermaid render wait before PDF capture — diagrams no longer appear as raw text
  (closes [#342](https://github.com/yzane/vscode-markdown-pdf/issues/342),
  [#365](https://github.com/yzane/vscode-markdown-pdf/issues/365),
  [#290](https://github.com/yzane/vscode-markdown-pdf/issues/290))
- Mermaid rendered locally from bundled `mermaid.min.js` — no CDN calls
  (closes [#30](https://github.com/yzane/vscode-markdown-pdf/issues/30),
  [#312](https://github.com/yzane/vscode-markdown-pdf/issues/312))
- TypeScript source with strict mode enabled
- esbuild bundle pipeline (`src/` -> `dist/extension.js`); pure-JS deps bundled into output, reducing .vsix size from ~60MB to ~16MB
- Cross-platform Chrome auto-detection (macOS, Linux, Windows)
  (closes [#336](https://github.com/yzane/vscode-markdown-pdf/issues/336))
- `github.css` syntax highlight theme as default

### Changed
- puppeteer-core: 2.1.1 -> 24.x (uses system Chrome, no bundled Chromium)
- All dependencies updated to current versions; 0 production CVEs
- Default margins: 2cm top/bottom, 2.5cm left/right (was 1.5cm/1cm/1cm/1cm)
- `displayHeaderFooter` default: `false` (was `true`)
- `markdown-it-anchor` replaces `markdown-it-named-headers` (ReDoS CVE in upstream)
- Settings count: ~30 -> 21

### Removed
- PlantUML support (sent diagram source to `plantuml.com`; use Mermaid instead)
- PNG/JPEG export
- Chromium auto-download (`createBrowserFetcher` removed in puppeteer v20)
  (closes [#341](https://github.com/yzane/vscode-markdown-pdf/issues/341))
- Settings: `scale`, `pageRanges`, `width`, `height`, `includeDefaultStyles`,
  `stylesRelativePathFile`, `outputDirectoryRelativePathFile`,
  `StatusbarMessageTimeout`, `debug`, `markdown-it-include.enable`

### Fixed
- Mermaid diagrams in PDF (Chromium 80 -> current; added async render wait)
- KaTeX single-line display math (`$$formula$$` on one line was not matched)
- `spawn Unknown system error -86` on macOS Ventura and later
  (closes [#336](https://github.com/yzane/vscode-markdown-pdf/issues/336))

### Security
- Patched CVE-2024-7739: XSS via unsanitized HTML in markdown blocks
  (closes [#411](https://github.com/yzane/vscode-markdown-pdf/issues/411))
- Removed bundled Chromium with known CVEs; extension now uses system Chrome
  (closes [#341](https://github.com/yzane/vscode-markdown-pdf/issues/341))
- `npm audit --omit=dev`: 0 vulnerabilities

### Fixed
- Inline `code` styling in PDF output (washed-out colour restored)
  (closes [#103](https://github.com/yzane/vscode-markdown-pdf/issues/103))
- YAML frontmatter `title:` now used in PDF header/footer `<span class='title'>`
  (closes [#193](https://github.com/yzane/vscode-markdown-pdf/issues/193))
- `%%ISO-DATE%%`, `%%ISO-DATETIME%%`, `%%ISO-TIME%%` tokens work correctly in header/footer templates
  (closes [#210](https://github.com/yzane/vscode-markdown-pdf/issues/210))
- Style paths in `markdown-pdf.styles` now resolve relative to the source `.md` file first, then workspace root
  (closes [#126](https://github.com/yzane/vscode-markdown-pdf/issues/126))
- User CSS now injected into PDF header/footer renderer context (Puppeteer renders header/footer separately from the page)
  (closes [#75](https://github.com/yzane/vscode-markdown-pdf/issues/75))
