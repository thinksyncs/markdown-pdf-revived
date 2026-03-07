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
- DOMPurify HTML sanitization: patches CVE-2024-7739
- Mermaid render wait before PDF capture (fixes diagrams rendering as raw text)
- TypeScript source with strict mode enabled
- esbuild bundle pipeline (`src/` -> `dist/extension.js`)
- Cross-platform Chrome auto-detection (macOS, Linux, Windows)
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
- Settings: `scale`, `pageRanges`, `width`, `height`, `includeDefaultStyles`,
  `stylesRelativePathFile`, `outputDirectoryRelativePathFile`,
  `StatusbarMessageTimeout`, `debug`, `markdown-it-include.enable`

### Fixed
- Mermaid diagrams in PDF (Chromium 80 -> current; added async render wait)
- KaTeX single-line display math (`$$formula$$` on one line was not matched)

### Security
- Patched CVE-2024-7739: XSS via unsanitized HTML in markdown blocks
- `npm audit --omit=dev`: 0 vulnerabilities
