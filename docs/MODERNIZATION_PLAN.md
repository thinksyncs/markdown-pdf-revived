# VSCode Markdown-PDF Extension Modernization Plan

**Date:** 7 March 2026  
**Goal:** Revive the unmaintained vscode-markdown-pdf extension, modernize the tech stack, remove unnecessary features, and create a lean, secure, 2026-ready PDF/HTML export tool.

---

## Executive Summary

This extension is **functionally useful but technically decrepit**:
- **256 open issues**, **35+ open PRs**, no maintainer activity since late 2023
- **Critically outdated dependencies**: Puppeteer 2.1.1 (2020), Chromium 80, Cheerio 0.20.0 (2016)
- **Security vulnerabilities**: CVE-2024-7739 (XSS) unpatched
- **Broken features**: Mermaid diagrams, no math support (LaTeX/KaTeX), PlantUML (75% of issues unresolved)
- **Poor code quality**: Single 902-line file, no TypeScript, no tests, no build system

**However**, the extension remains popular and fills a real need. A modernization effort is **highly justified** and has strong community support (PRs have 12+ 👍 reactions, users manually installing VSIX fixes).

---

## Competitive Positioning & Brand Identity

### Tagline
> **"A privacy-first, offline-capable Markdown to PDF converter for VSCode"**

### Core Differentiators

| Feature | Original (Abandoned) | **Revived (Modernized)** |
|---------|---------------------|--------------------------|
| **Privacy** | ❌ Sends PlantUML to external server | ✅ All rendering local, no external calls |
| **Offline** | ❌ PlantUML requires internet | ✅ 100% offline capable |
| **Security** | ❌ CVE-2024-7739 unpatched | ✅ Input sanitization, updated deps |
| **Maintenance** | ❌ Abandoned (2+ years) | ✅ Active maintenance, regular updates |
| **Code Quality** | ❌ 902-line monolith | ✅ Modular TypeScript, tested |
| **Focus** | ❌ PDF/HTML/PNG/JPEG (bloated) | ✅ PDF/HTML only (lean, fast) |
| **Diagrams** | ❌ PlantUML broken (75% bugs open) | ✅ Mermaid only (local, working) |
| **Dependencies** | ❌ 6+ year old packages | ✅ Current, audited, secure |

### Brand Pillars

1. **Privacy-First**
   - No external servers (PlantUML removed)
   - No telemetry
   - No data leaves your machine
   - No third-party CDN dependencies

2. **Offline-Capable**
   - Works without internet connection
   - All rendering happens locally
   - No external API calls
   - Bundled dependencies

3. **Lean & Fast**
   - PDF/HTML export only (no PNG/JPEG bloat)
   - Mermaid instead of PlantUML (smaller, faster)
   - Modern build system (esbuild)
   - Reduced codebase (~30% smaller)

4. **Secure by Default**
   - Input sanitization (DOMPurify)
   - Updated dependencies (no CVEs)
   - Modern Chromium (no known vulnerabilities)
   - Fail-safe error handling

5. **Actively Maintained**
   - Regular dependency updates
   - Responsive issue triage
   - Clear roadmap
   - Community-driven development

### Target Audience

1. **Privacy-conscious developers** - Don't want code/diagrams sent to external servers
2. **Offline workers** - Travel, planes, remote locations without reliable internet
3. **Security-focused teams** - Need audited, maintained dependencies
4. **Minimalists** - Want PDF export without bloat and unused features
5. **Daily users** - Need reliability, speed, and consistency

### Naming Strategy

**Primary:** `Markdown PDF (Revived)`  
**Alternatives:** `Markdown PDF Plus`, `Markdown PDF Offline`, `Markdown PDF Privacy`

**Risk Mitigation:** If original maintainer returns:
- Project remains valuable due to: smaller codebase, speed, security, privacy focus
- Positioning shifts to "privacy-focused fork" (like LibreOffice vs OpenOffice)
- Code quality and maintenance become the differentiator, not just "it works"
- Users who value privacy/offline will choose Revived regardless of original's status

### Marketing Copy (For README/Marketplace)

**Short pitch (1 sentence):**
> A privacy-first, offline-capable Markdown to PDF converter for VSCode — modernized, secure, and actively maintained.

**Medium pitch (paragraph):**
> Markdown PDF (Revived) brings the abandoned vscode-markdown-pdf extension back from the grave with a clear focus: **privacy, offline capability, and lean performance**. We removed PlantUML (which sent your diagrams to external servers), PNG/JPEG export (bloat), and 24+ obscure settings. What remains is a fast, secure, modern PDF/HTML exporter with Mermaid diagrams (local rendering), KaTeX math support, and a codebase you can trust. No telemetry. No external calls. No compromises.

**Long pitch (feature list):**
> - ✅ **Privacy-first** — All rendering happens locally, no external servers
> - ✅ **Offline-capable** — Works without internet, no CDN dependencies
> - ✅ **Lean & fast** — PDF/HTML only, ~30% smaller codebase
> - ✅ **Secure** — Input sanitization, updated dependencies, no CVEs
> - ✅ **Modern** — TypeScript, modular architecture, active maintenance
> - ✅ **Diagrams** — Mermaid support (local, offline, no PlantUML)
> - ✅ **Math** — KaTeX support (local, fast, no external calls)
> - ✅ **Beautiful** — 2026-ready styling, dark mode, accessible

---

## Executive Summary (Revised)

This extension is **functionally useful but technically decrepit**. However, this modernization effort will transform it into a **focused, privacy-first tool** with clear competitive advantages:

**Current state:**
- 256 open issues, 35+ open PRs, no maintainer activity since late 2023
- Critically outdated dependencies: Puppeteer 2.1.1 (2020), Chromium 80
- Security vulnerabilities: CVE-2024-7739 (XSS) unpatched
- Broken features: Mermaid, PlantUML (75% of issues unresolved), no math support

**Future state:**
- **Privacy-first** — PlantUML removed, no external servers
- **Offline-capable** — All rendering local, no CDN dependencies
- **Lean** — PDF/HTML only, ~30% smaller codebase
- **Secure** — Input sanitization, updated dependencies
- **Modern** — TypeScript, modular, tested, maintained

**Community demand:** Strong (PRs have 12+ 👍 reactions, users manually installing VSIX fixes)

---

## 1. Current State Analysis

### 1.1 Tech Stack (Critically Outdated)

| Dependency | Current | Latest | Status |
|------------|---------|--------|--------|
| puppeteer-core | ^2.1.1 (2020) | ^24.x | 🚨 CRITICAL |
| markdown-it | ^10.0.0 | ^14.x | 🚨 OUTDATED |
| highlight.js | ^9.18.1 | ^11.x | 🚨 OUTDATED |
| cheerio | ^0.20.0 (2016) | ^1.0.x | 🚨 CRITICAL |
| vscode engine | ^1.0.0 | ^1.85.0+ | 🚨 OUTDATED |

**Impact of old Puppeteer/Chromium:**
- Mermaid 10.5+ **broken** (lacks modern JS like `structuredClone`)
- Security vulnerabilities in bundled Chromium
- No modern web standards support

### 1.2 Current Features

| Feature | Status | Notes |
|---------|--------|-------|
| PDF Export | ✅ Working | Core functionality |
| HTML Export | ✅ Working | Static file export |
| PNG/JPEG Export | ✅ Working | **To be removed** |
| Syntax Highlighting | ✅ Working | highlight.js (70+ themes) |
| Emoji | ✅ Working | markdown-it-emoji |
| Task Lists | ✅ Working | markdown-it-checkbox |
| ~~PlantUML~~ | ❌ **Removing** | **Privacy/offline - replaced by Mermaid** |
| Mermaid | ⚠️ Broken | Old Chromium (PR #365 fixes, local rendering) |
| Math (LaTeX) | ❌ Not supported | PRs #386 (KaTeX, local), #400 (MathJax) pending |
| File Includes | ✅ Working | markdown-it-include |
| Front Matter | ✅ Working | gray-matter |

**Key Decision:** PlantUML removed entirely (8 issues, 75% unresolved, external server dependency). Mermaid becomes the sole diagram solution (local rendering, offline-capable).

### 1.3 Settings (Too Many, Many Unused)

**40+ configuration options**, including:
- 15+ PNG/JPEG-specific settings (quality, clip, omitBackground)
- 3 PlantUML settings (openMarker, closeMarker, server)
- Obscure options most users never touch
- Inconsistent naming conventions

### 1.4 Common User Complaints

1. **Mermaid broken** (#422) - "Diagrams render as raw code"
2. **No math support** (#419, #400, #386) - "LaTeX commands broken"
3. **PlantUML broken** (#245, #241, #190, #162) - "75% of PlantUML issues unresolved, external server required"
4. **PDF/HTML inconsistency** (#384) - "Different output for same markdown"
5. **No maintenance** (#416) - "Is this project dead?"
6. **Security vulnerability** (#411) - CVE-2024-7739 unpatched

---

## 2. Modernization Strategy

### Phase 1: Critical Fixes (Week 1-2)

**Goal:** Make the extension functional and secure again.

#### 2.1.1 Merge Community PRs

| PR | Changes | Priority |
|----|---------|----------|
| **#365** | Puppeteer 2.1.1 → 22.7.1 (fixes Mermaid) | 🔴 CRITICAL |
| **#386** | Add KaTeX for math (smaller, faster than MathJax) | 🔴 CRITICAL |
| **#399** | Fix PDF/HTML export inconsistency | 🟠 HIGH |
| **#418** | Add Puppeteer language setting | 🟡 MEDIUM |

**Action:** Review, test, and merge these PRs into the fork.

#### 2.1.2 Remove PlantUML (Privacy/Offline Positioning)

**Rationale:**
- 8 issues filed, 75% still unresolved (abandoned by maintainer)
- Requires external server (privacy concern, offline broken)
- Low usage (0 reactions on issues vs 12+ on Mermaid)
- Mermaid (local rendering) is superior alternative

**Changes:**
```javascript
// DELETE from extension.js (lines 269-276)
var plantumlOptions = { ... }
md.use(require('markdown-it-plantuml'), plantumlOptions);
```

```json
// DELETE from package.json
"markdown-it-plantuml": "^1.4.1"
```

**Settings removed (3):**
- `markdown-pdf.plantumlOpenMarker`
- `markdown-pdf.plantumlCloseMarker`
- `markdown-pdf.plantumlServer`

**Migration note for users:**
```markdown
### PlantUML Removed

PlantUML has been removed in favor of Mermaid diagrams. Mermaid renders locally 
(no external server), works offline, and covers most diagram types.

**Before (PlantUML):**
\`\`\`
@startuml
Alice -> Bob: Hello
@enduml
\`\`\`

**After (Mermaid):**
\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: Hello
  Bob-->>Alice: Hi
\`\`\`
```

#### 2.1.3 Update All Dependencies

```json
{
  "puppeteer-core": "^24.x",
  "markdown-it": "^14.x",
  "highlight.js": "^11.x",
  "cheerio": "^1.0.x",
  "gray-matter": "^4.0.3",
  "markdown-it-emoji": "^3.x",
  "markdown-it-container": "^4.x",
  "markdown-it-include": "^2.x",
  "mustache": "^4.2.0",
  "mkdirp": "^3.x",
  "rimraf": "^6.x"
}
```

**Action:** Update `package.json`, test all features, fix breaking changes.

#### 2.1.3 Fix Security Vulnerability (CVE-2024-7739)

**Problem:** Extension processes untrusted markdown without sanitization.

**Solution:** Add `dompurify` or similar library to sanitize HTML output.

```javascript
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize before rendering
const sanitizedHtml = DOMPurify.sanitize(renderedHtml);
```

---

### Phase 2: Architecture Refactoring (Week 3-4)

**Goal:** Transform from monolithic JS file to modular TypeScript codebase.

#### 2.2.1 Convert to TypeScript

**Benefits:**
- Type safety
- Better IDE support
- Easier refactoring
- Catch errors at compile time

**Action:** Add `tsconfig.json`, convert all `.js` to `.ts`.

#### 2.2.2 Modularize Code Structure

**Current:** Single 902-line `extension.js` file

**New Structure:**
```
src/
├── extension.ts              # Entry point, command registration
├── commands/
│   ├── exportPdf.ts          # PDF export logic
│   ├── exportHtml.ts         # HTML export logic
│   └── showSettings.ts       # Settings command
├── converters/
│   ├── markdownToHtml.ts     # Markdown processing pipeline
│   ├── plugins.ts            # Plugin configuration
│   └── sanitizeHtml.ts       # Security sanitization
├── exporters/
│   ├── pdfExporter.ts        # Puppeteer PDF generation
│   └── htmlExporter.ts       # Static HTML export
├── config/
│   ├── settings.ts           # Settings schema & defaults
│   └── types.ts              # TypeScript interfaces
├── styles/
│   ├── loadStyles.ts         # CSS loading & injection
│   └── defaultStyles.ts      # Built-in styles
├── utils/
│   ├── pathUtils.ts          # Path resolution
│   ├── fileUtils.ts          # File I/O operations
│   └── logger.ts             # Logging utilities
└── template/
    └── template.html         # HTML template
```

**Benefits:**
- Separation of concerns
- Easier to test
- Lower cognitive load
- Safer refactoring

#### 2.2.3 Add Build System

**Tool:** esbuild (fast, small bundles, VSCode-compatible)

**Action:** Add build scripts to `package.json`:
```json
{
  "scripts": {
    "build": "esbuild src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --platform=node",
    "watch": "npm run build -- --watch",
    "package": "vsce package",
    "lint": "eslint src/**/*.ts",
    "test": "jest"
  }
}
```

#### 2.2.4 Add Testing

**Framework:** Jest + VSCode test runner

**Test Coverage:**
- Unit tests for converters
- Integration tests for PDF/HTML export
- Snapshot tests for rendered output

---

### Phase 3: Feature Cleanup (Week 5-6)

**Goal:** Remove unnecessary features, simplify settings, modernize defaults.

#### 2.3.1 Remove PNG/JPEG Export

**Files to modify:**
- `extension.ts` - Remove `exportPng()`, `exportJpeg()` functions
- `package.json` - Remove PNG/JPEG commands and settings

**Settings to remove:**
```json
"markdown-pdf.quality": "JPEG quality (0-100)",
"markdown-pdf.clip.x": "Screenshot crop X",
"markdown-pdf.clip.y": "Screenshot crop Y",
"markdown-pdf.clip.width": "Screenshot crop width",
"markdown-pdf.clip.height": "Screenshot crop height",
"markdown-pdf.omitBackground": "Transparent background"
```

**Result:** ~15% code reduction, simpler settings UI.

#### 2.3.2 Simplify Settings

**Keep (Essential):**
| Setting | Default | Notes |
|---------|---------|-------|
| `type` | `["pdf"]` | Output format (PDF, HTML only) |
| `convertOnSave` | `false` | Auto-convert on save |
| `outputDirectory` | `""` | Custom output folder |
| `styles` | `[]` | Custom CSS files |
| `highlight` | `true` | Syntax highlighting |
| `highlightStyle` | `""` | Theme selection |
| `format` | `"A4"` | Paper size |
| `orientation` | `"portrait"` | Page orientation |
| `margin` | `{}` | Page margins |
| `displayHeaderFooter` | `false` | Show header/footer |
| `headerTemplate` | `""` | Custom header |
| `footerTemplate` | `""` | Custom footer |
| `printBackground` | `true` | Print backgrounds |
| `breaks` | `false` | Line breaks |
| `emoji` | `true` | Emoji support |
| `math` | `true` | **NEW** KaTeX support |

**Remove (Obsolete/Rarely Used):**
- `stylesRelativePathFile` - Confusing, edge case
- `outputDirectoryRelativePathFile` - Confusing, edge case
- `includeDefaultStyles` - Why would you disable this?
- `scale` - Rarely needed, defaults work
- `pageRanges` - Edge case
- `width`/`height` - Use `format` instead
- `executablePath` - Advanced, document in README
- ~~`plantumlOpenMarker`/`plantumlCloseMarker`~~ - **PlantUML removed**
- ~~`plantumlServer`~~ - **PlantUML removed**
- ~~`mermaidServer`~~ - Bundled with new Puppeteer, no config needed
- `markdown-it-include.enable` - Defaults fine
- `StatusbarMessageTimeout` - Internal, not user-facing
- `debug` - Use VSCode developer tools

**Result:** ~40 settings → ~16 settings (60% reduction).

**Settings removed by category:**
| Category | Count |
|----------|-------|
| PNG/JPEG | 15+ |
| PlantUML | 3 |
| Obscure/Edge case | ~6 |
| **Total** | **~24** |

#### 2.3.3 Modernize Defaults

**Updated defaults for 2026:**

```json
{
  "markdown-pdf.type": ["pdf"],
  "markdown-pdf.format": "A4",
  "markdown-pdf.orientation": "portrait",
  "markdown-pdf.margin": {
    "top": "2cm",
    "bottom": "2cm",
    "left": "2.5cm",
    "right": "2.5cm"
  },
  "markdown-pdf.displayHeaderFooter": false,
  "markdown-pdf.printBackground": true,
  "markdown-pdf.highlight": true,
  "markdown-pdf.highlightStyle": "github-dark", // Modern default
  "markdown-pdf.breaks": false,
  "markdown-pdf.emoji": true,
  "markdown-pdf.math": true // NEW: Enable KaTeX by default
}
```

#### 2.3.4 Update Color Scheme & Styling

**Current:** VSCode 2018-era styling (dated)

**2026 Modern Updates:**

1. **Typography:**
   - Font stack: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
   - Better line-height: `1.6` → `1.7`
   - Better font-size: `14px` → `15px`

2. **Code Blocks:**
   - Rounded corners: `6px`
   - Subtle shadow: `0 2px 8px rgba(0,0,0,0.1)`
   - Better padding: `16px`
   - Modern syntax highlighting (github-dark, one-dark-pro)

3. **Tables:**
   - Striped rows
   - Better cell padding
   - Sticky header for long tables
   - Border radius on corners

4. **Headings:**
   - Better hierarchy
   - Subtle underline on h1
   - Better spacing

5. **Dark Mode Support:**
   - Detect VSCode theme
   - Inject appropriate CSS variables
   - Auto-switch based on user preference

6. **Accessibility:**
   - Better color contrast (WCAG AA)
   - Semantic HTML
   - ARIA labels where appropriate

**Action:** Rewrite `styles/markdown.css` and `styles/markdown-pdf.css` with modern design.

---

### Phase 4: Documentation & Release (Week 7-8)

#### 2.4.1 Update README

**Sections:**
- Installation (fork vs original)
- Quick start
- Features (updated list)
- Settings (simplified list)
- Troubleshooting (common issues)
- Migration guide (from original extension)
- Changelog

#### 2.4.2 Migration Guide

**For users upgrading from original:**

1. **Uninstall original extension**
2. **Install fork**
3. **Settings changes:**
   - PNG/JPEG settings removed (no replacement)
   - Some defaults changed (review settings)
   - New `math` setting enabled by default
4. **Breaking changes:**
   - None expected, but test your workflow

#### 2.4.3 Changelog

**Format:** Keep a Changelog (https://keepachangelog.com/)

**v2.0.0 (2026-XX-XX):**
```
## Changed
- Updated Puppeteer 2.1.1 → 24.x (fixes Mermaid rendering)
- Updated all dependencies to latest versions
- Converted codebase to TypeScript
- Modularized architecture (single file → 15+ modules)
- Simplified settings (40 → 16 options)
- Modernized default styling for 2026

## Added
- KaTeX math support (PR #386)
- Dark mode support
- Input sanitization (fixes CVE-2024-7739)
- Comprehensive test suite

## Removed
- PNG/JPEG export functionality
- 24+ obsolete settings
- Deprecated VSCode APIs

## Fixed
- Mermaid diagram rendering (#422)
- PDF/HTML export inconsistency (#384)
- LaTeX spacing commands (#419)
```

#### 2.4.4 Publish to VSCode Marketplace

**Options:**
1. **Publish as new extension** (new ID, new listing)
   - Pros: Clean break, no confusion
   - Cons: Lose existing user base

2. **Contact @yzane for transfer** (unlikely to respond)
   - Pros: Keep existing users
   - Cons: May not respond

3. **Publish as fork** (mention original in README)
   - Pros: Clear lineage, users can choose
   - Cons: Some confusion

**Recommendation:** Option 3 - Publish as "Markdown PDF (Revived)" or "Markdown PDF Plus"

---

## 3. Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Fork repository
- [ ] Review and merge PR #365 (Puppeteer upgrade)
- [ ] Review and merge PR #386 (KaTeX support)
- [ ] Review and merge PR #399 (PDF/HTML consistency)
- [ ] Update all dependencies in `package.json`
- [ ] Add DOMPurify for input sanitization
- [ ] Test all features with updated dependencies
- [ ] Fix any breaking changes from updates

### Phase 2: Architecture Refactoring
- [ ] Set up TypeScript configuration
- [ ] Create modular file structure
- [ ] Convert `extension.js` to TypeScript modules
- [ ] Add esbuild build system
- [ ] Add ESLint configuration
- [ ] Set up Jest testing
- [ ] Write unit tests for core functions
- [ ] Write integration tests for PDF/HTML export
- [ ] Ensure all tests pass

### Phase 3: Feature Cleanup
- [ ] Remove PNG/JPEG export code
- [ ] Remove PNG/JPEG settings from `package.json`
- [ ] Consolidate settings (40 → 16)
- [ ] Update default values for 2026
- [ ] Rewrite CSS with modern styling
- [ ] Add dark mode support
- [ ] Improve accessibility (contrast, semantic HTML)
- [ ] Test all remaining features

### Phase 4: Documentation & Release
- [ ] Write comprehensive README
- [ ] Write migration guide
- [ ] Write changelog
- [ ] Update package.json metadata
- [ ] Create extension icon/banner (optional)
- [ ] Test extension in VSCode
- [ ] Package extension (.vsix)
- [ ] Publish to VSCode Marketplace
- [ ] Announce on GitHub issues (original repo)
- [ ] Announce on Reddit/r/vscode (optional)

---

## 3.5 Mermaid CDN Dependency (Issue Flagged: Phase 1.3)

### Problem

The `markdown-pdf.mermaidServer` setting currently defaults to an **external CDN**:

```
"markdown-pdf.mermaidServer": {
  "default": "https://unpkg.com/mermaid/dist/mermaid.min.js"
}
```

This is injected directly into the HTML template as a `<script src="...">` tag (`extension.js`, `makeHtml()` function). Every PDF/HTML export triggers a network request to `unpkg.com` to load Mermaid.

**This directly contradicts the project's core positioning:**
- ❌ **Not privacy-first** — unpkg.com can log your IP and request metadata
- ❌ **Not offline-capable** — export silently fails or renders blank diagrams without internet
- ❌ **Not trustworthy** — CDN content can change, be compromised, or go down

### Options

| Option | Pros | Cons | Recommended Phase |
|--------|------|------|-------------------|
| **A. Bundle Mermaid locally** (vendor it into `node_modules`, copy to dist, serve as `file://` URI) | Full offline, private, fast, no CDN | Increases bundle size (~2MB), must update manually | ✅ Phase 1.4 (alongside Puppeteer upgrade) |
| **B. Use Puppeteer's page.evaluate() to inject Mermaid** (load from local file via `fs.readFileSync` + inline `<script>`) | Offline, private, no extra file copying | Slightly more complex | ✅ Phase 1.4 alternative |
| **C. Remove mermaidServer setting, hardcode local path** | Simplest — removes user-facing confusion | Less flexible | ✅ Phase 1.4 alongside option A or B |
| **D. Keep CDN but make it opt-in / warn user** | Low effort now | Still breaks offline/privacy promise | ❌ Reject — contradicts brand |

### Recommended Action (Phase 1.4)

When Puppeteer is upgraded (Phase 1.4), implement **Option A + C**:

1. After `npm install mermaid`, copy `node_modules/mermaid/dist/mermaid.min.js` into a `vendor/` folder
2. In `makeHtml()`, replace the CDN `<script src>` with an inline `<script>` containing the file contents (base64 or raw inject)
3. Remove `markdown-pdf.mermaidServer` setting entirely from `package.json`
4. Document in README: "Mermaid renders locally — no internet required"

### Current Workaround

Until Phase 1.4, users can set `"markdown-pdf.mermaidServer": ""` to disable CDN loading (diagrams won't render but no external call is made). This should be documented.

---

## 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Upstream remains unmaintained | High | Medium | Fork is independent |
| Breaking changes from updates | Medium | Medium | Thorough testing, semantic versioning |
| User backlash (removed features) | Low | Low | Clear communication, migration guide |
| Security vulnerabilities persist | Low | High | Regular dependency updates, audits |
| Mermaid still broken after PR #365 | Low | Medium | Test thoroughly, have fallback |
| KaTeX conflicts with existing features | Low | Medium | Test with complex documents |

---

## 5. Success Metrics

**Functional:**
- [ ] PDF export works for all test documents
- [ ] HTML export works for all test documents
- [ ] Mermaid diagrams render correctly
- [ ] Math/KaTeX renders correctly
- [ ] No console errors in VSCode developer tools

**Quality:**
- [ ] 80%+ test coverage
- [ ] Zero ESLint errors
- [ ] Zero TypeScript errors
- [ ] All dependencies up-to-date
- [ ] No known security vulnerabilities

**User Experience:**
- [ ] Extension loads in < 1 second
- [ ] PDF export completes in < 5 seconds (typical doc)
- [ ] Settings UI is clean and understandable
- [ ] Documentation answers common questions

**Adoption (3 months post-launch):**
- [ ] 100+ active users
- [ ] 4.5+ star rating
- [ ] < 5 open issues (vs 256 in original)
- [ ] Active community engagement

---

## 6. Technical Decisions & Rationale

### 6.1 Why KaTeX over MathJax?

| Factor | KaTeX | MathJax |
|--------|-------|---------|
| Bundle size | ~200KB | ~2MB |
| Rendering speed | Fast (sync) | Slower (async) |
| Browser support | Modern browsers | All browsers |
| Feature coverage | 95% of LaTeX | 99% of LaTeX |
| VSCode compatibility | ✅ Excellent | ⚠️ Some issues |

**Decision:** KaTeX (PR #386) - smaller, faster, better VSCode integration.

### 6.2 Why Remove PNG/JPEG?

1. **User request** - Primary use case is PDF
2. **Code reduction** - ~15% less code
3. **Simpler settings** - Remove 15+ PNG/JPEG options
4. **Focus** - Do PDF/HTML exceptionally well
5. **Alternatives exist** - VSCode has built-in screenshot tools

### 6.3 Why Remove PlantUML?

| Factor | PlantUML | Mermaid (Replacement) |
|--------|----------|----------------------|
| **Issues** | 8 filed, 6 still open (75%) | 1 issue (being fixed) |
| **Maintenance** | Abandoned (0% resolution) | Active (PR #365 fixes) |
| **Privacy** | ❌ Sends diagrams to external server | ✅ Local rendering |
| **Offline** | ❌ Requires internet | ✅ Works offline |
| **Dependencies** | External Java server | Bundled JavaScript |
| **User demand** | 0 reactions on issues | 12+ 👍 on Mermaid fix |
| **Code quality** | 75% bugs unresolved | Working after merge |

**Decision rationale:**
1. **Privacy** - PlantUML sends your diagram source to `http://www.plantuml.com/plantuml`
2. **Offline** - PlantUML requires external server (broken on planes, remote locations)
3. **Abandoned** - 75% of PlantUML issues unresolved, maintainer inactive
4. **Low demand** - Zero community reactions vs strong Mermaid demand
5. **Better alternative** - Mermaid covers 90% of use cases, renders locally

**Migration path:**
- Document Mermaid syntax for common PlantUML diagrams
- Provide conversion examples in README
- Mermaid supports: flowcharts, sequence diagrams, class diagrams, gantt charts, state diagrams

### 6.4 Why TypeScript?

1. **Type safety** - Catch errors at compile time
2. **Better IDE support** - IntelliSense, refactoring
3. **Self-documenting** - Types serve as documentation
4. **Easier maintenance** - Clear contracts between modules
5. **Industry standard** - Most VSCode extensions use TypeScript

### 6.5 Why esbuild over webpack?

1. **Speed** - 10-100x faster builds
2. **Simplicity** - Minimal configuration
3. **Small bundles** - Tree-shaking built-in
4. **VSCode-compatible** - Used by many extensions
5. **Low maintenance** - No complex config drift

---

## 7. Sample Test Documents

Create a test suite with these markdown files:

1. **basic.md** - Simple headings, paragraphs, lists
2. **code.md** - Code blocks with syntax highlighting
3. **tables.md** - Complex tables with merged cells
4. **math.md** - LaTeX equations (KaTeX test)
5. **mermaid.md** - Mermaid diagrams (flowchart, sequence, class, gantt)
6. **emoji.md** - Emoji rendering
7. **frontmatter.md** - YAML front matter
8. **includes.md** - File includes
9. **long-document.md** - 50+ pages (test pagination)

**Expected outputs:** PDF and HTML for each, manually verified.

---

## 8. Budget & Timeline

### Time Estimate

| Phase | Duration | Hours |
|-------|----------|-------|
| Phase 1: Critical Fixes | 1-2 weeks | 20-30 |
| Phase 2: Architecture | 2-3 weeks | 40-50 |
| Phase 3: Feature Cleanup | 1-2 weeks | 20-30 |
| Phase 4: Documentation | 1 week | 10-15 |
| **Total** | **5-8 weeks** | **90-125 hours** |

### Cost (If Outsourcing)

| Role | Rate | Hours | Total |
|------|------|-------|-------|
| Senior TS Developer | $100/hr | 60 | $6,000 |
| QA Tester | $50/hr | 30 | $1,500 |
| Technical Writer | $75/hr | 15 | $1,125 |
| **Total** | | **105** | **$8,625** |

**Note:** As a personal project, cost is time only.

---

## 9. Long-Term Maintenance Plan

### 9.1 Ongoing Responsibilities

1. **Dependency updates** - Monthly check, quarterly updates
2. **Security patches** - Immediate response to CVEs
3. **Issue triage** - Weekly review of new issues
4. **PR reviews** - Review community contributions
5. **VSCode compatibility** - Test with each VSCode release
6. **Documentation updates** - Keep README current

### 9.2 Community Engagement

1. **GitHub Issues** - Respond within 1 week
2. **PR Reviews** - Respond within 2 weeks
3. **Release Notes** - Clear changelog for each version
4. **Roadmap** - Public roadmap in GitHub Discussions

### 9.3 Avoiding "Abandonware" Fate

1. **Find co-maintainers** - Recruit 2-3 trusted contributors
2. **Document everything** - Reduce bus factor
3. **Automate** - CI/CD, automated dependency updates
4. **Set expectations** - Clear scope, say "no" to feature creep
5. **Regular releases** - Quarterly minor releases, annual major

---

## 10. Conclusion

This modernization effort will transform a **decrepit, unmaintained extension** into a **modern, privacy-first, offline-capable tool** with a clear competitive positioning.

**Key improvements:**
- ✅ Fix broken features (Mermaid, math)
- ✅ Patch security vulnerabilities (CVE-2024-7739)
- ✅ **Remove PlantUML** (privacy/offline positioning, 75% bugs unresolved)
- ✅ Remove PNG/JPEG (focus on PDF/HTML, ~15% code reduction)
- ✅ Modernize codebase (TypeScript, modules, tests)
- ✅ Update styling for 2026
- ✅ Establish sustainable maintenance model

**Competitive Differentiators:**
| Feature | Original (Abandoned) | **Revived (Modernized)** |
|---------|---------------------|--------------------------|
| Privacy | ❌ Sends PlantUML to external server | ✅ All rendering local |
| Offline | ❌ PlantUML requires internet | ✅ 100% offline capable |
| Security | ❌ CVE-2024-7739 unpatched | ✅ Input sanitization, updated deps |
| Maintenance | ❌ Abandoned (2+ years) | ✅ Active maintenance |
| Code Quality | ❌ 902-line monolith | ✅ Modular TypeScript, tested |
| Focus | ❌ PDF/HTML/PNG/JPEG (bloated) | ✅ PDF/HTML only (lean) |
| Diagrams | ❌ PlantUML broken (75% bugs) | ✅ Mermaid only (local, working) |

**Brand Positioning:**
> **"A privacy-first, offline-capable Markdown to PDF converter for VSCode"**

**Community impact:** 256 open issues and 35+ PRs show clear demand for a maintained fork. Users are already manually installing VSIX files from PRs to get working features.

**Personal impact:** You'll have a reliable, modern extension that works for your daily workflow, respects your privacy, works offline, and gives back to the community that's been waiting for someone to take ownership.

**If original maintainer returns:**
- Project remains valuable due to: privacy focus, offline capability, smaller codebase, speed, security
- Positioning: "privacy-focused fork" (like LibreOffice vs OpenOffice)
- Users who value privacy/offline will choose Revived regardless

---

## Appendix A: Files Requiring Changes

### Critical Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Update dependencies, remove PNG/JPEG settings, **remove PlantUML**, update VSCode engine |
| `extension.js` | Complete rewrite → TypeScript modules, **remove PlantUML code** |
| `template/template.html` | Add KaTeX, modernize HTML5, add dark mode |
| `styles/markdown.css` | Complete rewrite with 2026 design |
| `styles/markdown-pdf.css` | Update typography, spacing, accessibility |
| `styles/tomorrow.css` | Replace with modern syntax themes |
| `README.md` | **Document PlantUML removal, add Mermaid migration guide** |

### Files to Delete

| File/Code | Reason |
|-----------|--------|
| PNG/JPEG export code in `extension.js` | Removing image export |
| **PlantUML code in `extension.js` (lines 269-276)** | **Removing external server dependency** |
| **`markdown-it-plantuml` dependency** | **PlantUML removed** |
| Unused utility functions | Code cleanup |

### New Files to Create

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `esbuild.config.js` | Build configuration |
| `jest.config.js` | Test configuration |
| `.eslintrc.json` | Linting rules |
| `src/**/*.ts` | Modular TypeScript code |
| `tests/**/*.test.ts` | Test suite |
| `CHANGELOG.md` | Version history |
| `MIGRATION.md` | Migration guide (includes PlantUML → Mermaid) |

---

## Appendix B: Recommended VSCode Extensions for Development

- **ESLint** - Real-time linting
- **Prettier** - Code formatting
- **Jest Runner** - Run tests from editor
- **GitLens** - Git integration
- **Error Lens** - Inline error display
- **Todo Highlight** - Track TODO comments

---

## Appendix C: Useful Commands

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Watch mode (auto-rebuild)
npm run watch

# Run tests
npm test

# Package extension
npm run package

# Publish to marketplace
vsce publish

# Check for outdated dependencies
npm outdated

# Check for security vulnerabilities
npm audit
```

---

**Good luck bringing this extension back from the grave!** 🚀
