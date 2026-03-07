# Community Issues Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the 8 highest-priority open issues from yzane/vscode-markdown-pdf that are actionable in this fork.

**Architecture:** All changes are in the TypeScript source (`src/`). Build with `npm run build`. No new external dependencies except `markdown-it-footnote` (Task 6).

**Tech Stack:** TypeScript, markdown-it plugin system, Puppeteer (pdf.ts), CSS (styles/)

**Branch:** Continue on `feature/phase-3-cleanup` (or create `feature/community-fixes` from it).

**Anti-slop rule:** All user-facing strings (error messages, setting descriptions) follow `docs/anti-ai-slop.md`. No em-dashes, no exclamation marks, active voice, imperative for instructions.

---

## Task 1: Fix inline code colour (Issue #103)

**Priority:** Highest — affects every document with inline code. Pure CSS, zero risk.

**Files:**
- Modify: `styles/markdown.css`

**What to do:**

The original extension switched to Puppeteer (Chrome), which stopped applying the red `code` colour from the old stylesheet. The current `markdown.css` has no `code` colour rule.

Add a styled `code` rule that gives inline code a visible appearance in PDF output. Match the `github.css` highlight theme aesthetic (light grey background, muted red text — the de-facto standard developers expect):

```css
/* Inline code */
code {
  background-color: #f6f8fa;
  color: #d63333;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 87.5%;
  font-family: ui-monospace, 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
}

/* Do not double-style code inside pre blocks */
pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}
```

**Step 1:** Read `styles/markdown.css` to find where to insert (after the `<p>` or list rules, before `blockquote`).

**Step 2:** Add the CSS rules above.

**Step 3:** Open `test-docs/code.md`, export to PDF, verify inline code is red/styled and code blocks are unaffected.

**Step 4:** Commit.

```bash
git add styles/markdown.css
git commit -m "fix: restore inline code colour in PDF output (issue #103)"
```

---

## Task 2: Use frontmatter `title` in PDF header (Issue #193)

**Priority:** High — affects anyone using `displayHeaderFooter: true` with YAML frontmatter.

**Files:**
- Modify: `src/converter/markdown.ts` — export `matterData` alongside rendered HTML
- Modify: `src/template/page.ts` — accept and pass through frontmatter data
- Modify: `src/exporter/pdf.ts` — replace `<span class='title'>` with frontmatter title when present

**What to do:**

`gray-matter` already parses frontmatter in `markdown.ts`. The parsed `matterParts.data` is discarded after use. We need to return it so `pdf.ts` can inject `matter.data.title` into the header/footer template.

**Step 1:** In `src/converter/markdown.ts`, change `convertMarkdown()` return type:

```typescript
// Before
export async function convertMarkdown(text: string, uri: vscode.Uri): Promise<string>

// After
export interface ConvertResult {
  html: string;
  title?: string;  // from frontmatter, if present
}
export async function convertMarkdown(text: string, uri: vscode.Uri): Promise<ConvertResult>
```

Return `{ html: md.render(matterParts.content), title: matterParts.data['title'] as string | undefined }`.

**Step 2:** Update all callers of `convertMarkdown()` — check `src/exporter/html.ts` and `src/exporter/pdf.ts` — to use `.html` from the result.

**Step 3:** In `src/exporter/pdf.ts`, where `headerTemplate` and `footerTemplate` are set, add a preprocessing step: if `result.title` is set, replace the filename in the rendered header with the frontmatter title.

The simplest approach: Puppeteer's `<span class='title'>` is injected by Chrome and always shows the document title (set via `<title>` in the HTML). So the fix is in `src/template/page.ts`:

```typescript
// page.ts makeHtml() — currently:
const title = path.basename(uri.fsPath);
return mustache.render(template, { title, style, content, mermaid });

// Change to:
export async function makeHtml(uri: vscode.Uri, result: ConvertResult): Promise<string> {
  const title = result.title ?? path.basename(uri.fsPath);
  // ... rest unchanged
}
```

This sets `<title>` in the HTML, and Puppeteer reads the page `<title>` to populate `<span class='title'>` in header/footer.

**Step 4:** Run `tsc --noEmit` — fix any type errors.

**Step 5:** Test: create a `.md` file with `---\ntitle: My Document\n---`, enable `displayHeaderFooter`, export PDF, verify header shows "My Document" not the filename.

**Step 6:** Commit.

```bash
git add src/converter/markdown.ts src/template/page.ts src/exporter/pdf.ts src/exporter/html.ts
git commit -m "fix: use frontmatter title in PDF header/footer (issue #193)"
```

---

## Task 3: Verify `%%ISO-DATE%%` token (Issue #210)

**Priority:** Medium — may already be fixed. Verify before marking resolved.

**Files:**
- Possibly modify: `src/exporter/pdf.ts`

**What to do:**

**Step 1:** Search for `ISO-DATE` in the codebase:

```bash
grep -rn "ISO-DATE\|ISO-DATETIME\|ISO-TIME\|transformTemplate" src/
```

**Step 2:** Read the `transformTemplate()` function in `pdf.ts`. Confirm it replaces `%%ISO-DATE%%` with a `YYYY-MM-DD` formatted date string.

**Step 3:** If it does — verify the default `headerTemplate` in `package.json` uses `%%ISO-DATE%%`. Open a test doc, set `displayHeaderFooter: true`, export PDF, confirm date appears as `YYYY-MM-DD`.

**Step 4a:** If working — add a comment in the code and mark issue as resolved in CHANGELOG. No code change needed.

**Step 4b:** If broken — fix the regex in `transformTemplate()` so `%%ISO-DATE%%` is replaced with `new Date().toISOString().slice(0, 10)`.

**Step 5:** Commit only if a code change was made.

```bash
git add src/exporter/pdf.ts
git commit -m "fix: ensure %%ISO-DATE%% token renders as YYYY-MM-DD in header (issue #210)"
```

---

## Task 4: Resolve relative CSS paths next to the `.md` file (Issue #126)

**Priority:** Medium — users expect `./style.css` in the same directory as the `.md` to just work.

**Files:**
- Modify: `src/template/page.ts` — `readStyles()` function

**What to do:**

Currently, paths in `markdown-pdf.styles` resolve relative to the workspace root via `fixHref()`. A path like `./style.css` when the `.md` is in a subfolder will fail.

**Step 1:** Read `fixHref()` in `src/template/page.ts`.

**Step 2:** In `readStyles()`, for each user style path, try resolving in this order:
1. As-is (absolute path)
2. Relative to the directory of the source `.md` file (`path.dirname(uri.fsPath)`)
3. Relative to the workspace root

```typescript
function resolveStylePath(href: string, uri: vscode.Uri): string {
  if (path.isAbsolute(href)) return href;
  // Try relative to the md file first
  const relToFile = path.resolve(path.dirname(uri.fsPath), href);
  if (fs.existsSync(relToFile)) return relToFile;
  // Fall back to workspace root
  const workspaceRoot = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath ?? '';
  return path.resolve(workspaceRoot, href);
}
```

Then use this resolved absolute path in the `<link>` tag via `vscode.Uri.file(resolved).toString()`.

**Step 3:** Run `tsc --noEmit`.

**Step 4:** Test: create `test-docs/style-test/test.md` and `test-docs/style-test/custom.css`. Add `"markdown-pdf.styles": ["./custom.css"]` to workspace settings. Export PDF. Verify CSS applies.

**Step 5:** Commit.

```bash
git add src/template/page.ts
git commit -m "fix: resolve style paths relative to the source .md file (issue #126)"
```

---

## Task 5: CSS not applied to PDF header/footer (Issue #75)

**Priority:** Medium — Puppeteer renders header/footer in a separate context with no access to page stylesheets.

**Files:**
- Modify: `src/exporter/pdf.ts`
- Modify: `src/template/page.ts` — add helper to read user CSS as text

**What to do:**

Puppeteer's `headerTemplate` and `footerTemplate` HTML are rendered in a separate renderer context. `<link>` tags inside them are ignored. The only way to style them is via inline `<style>` blocks.

**Step 1:** Add a helper in `src/template/page.ts`:

```typescript
export function readUserStylesAsText(uri: vscode.Uri): string {
  let css = '';
  for (const href of config.styles(uri)) {
    try {
      const resolved = resolveStylePath(href, uri);
      css += fs.readFileSync(resolved, 'utf8') + '\n';
    } catch {
      // skip unresolvable paths
    }
  }
  return css;
}
```

**Step 2:** In `src/exporter/pdf.ts`, before calling `page.pdf()`, prepend a `<style>` block containing the user CSS to both `headerTemplate` and `footerTemplate`:

```typescript
const userCss = readUserStylesAsText(uri);
const styleBlock = userCss ? `<style>${userCss}</style>` : '';

await page.pdf({
  ...
  headerTemplate: styleBlock + transformTemplate(config.headerTemplate(uri)),
  footerTemplate: styleBlock + transformTemplate(config.footerTemplate(uri)),
});
```

**Step 3:** Run `tsc --noEmit`.

**Step 4:** Test: create a custom CSS with `.title { color: red; font-size: 14px; }`, add to `markdown-pdf.styles`, enable `displayHeaderFooter`, export PDF, verify header title is styled.

**Step 5:** Commit.

```bash
git add src/exporter/pdf.ts src/template/page.ts
git commit -m "fix: inject user CSS into PDF header/footer context (issue #75)"
```

---

## Task 6: Add footnote support (Issue #131)

**Priority:** Medium — one `npm install`, one `md.use()` line. Widely used in academic and technical writing.

**Files:**
- Modify: `package.json` — add `markdown-it-footnote` dependency
- Modify: `src/converter/markdown.ts` — register plugin
- Modify: `styles/markdown-pdf.css` — style the footnote section

**What to do:**

**Step 1:** Install the package:

```bash
npm install markdown-it-footnote
npm install --save-dev @types/markdown-it-footnote  # if types exist, otherwise skip
```

**Step 2:** In `src/converter/markdown.ts`, after the other `md.use()` calls, add:

```typescript
md.use(require('markdown-it-footnote'));
```

No setting needed — footnotes are standard Markdown syntax (`[^1]`). Always on.

**Step 3:** Add footnote CSS to `styles/markdown-pdf.css`:

```css
/* Footnotes */
.footnotes {
  border-top: 1px solid #e1e4e8;
  margin-top: 2em;
  padding-top: 1em;
  font-size: 0.875em;
  color: #57606a;
}
.footnotes ol {
  padding-left: 1.5em;
}
```

**Step 4:** Run `tsc --noEmit` and `npm run build`.

**Step 5:** Test: create a `.md` with `This is a claim.[^1]\n\n[^1]: Source for the claim.`, export PDF, verify footnote appears at bottom with a horizontal rule above it.

**Step 6:** Update `README.md` — add one bullet to the Features section: `- Footnotes via \`[^1]\` syntax`.

**Step 7:** Update `package.json` `description` if relevant.

**Step 8:** Commit.

```bash
git add src/converter/markdown.ts styles/markdown-pdf.css package.json package-lock.json README.md
git commit -m "feat: add footnote support via markdown-it-footnote (issue #131)"
```

---

## Task 7: GitHub-style callouts / admonitions (Issue #364)

**Priority:** Lower — growing use in documentation. Medium effort.

**Files:**
- Modify: `src/converter/markdown.ts` — add custom renderer rule
- Modify: `styles/markdown-pdf.css` — add callout styles

**What to do:**

GitHub's callout syntax uses blockquotes with a special first line:

```markdown
> [!NOTE]
> This is a note.

> [!WARNING]
> This is a warning.
```

No npm package needed — implement as a markdown-it renderer rule that transforms `blockquote` tokens where the first paragraph text matches `\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]`.

**Step 1:** In `src/converter/markdown.ts`, after `md` is constructed, add a custom renderer override for `blockquote_open`. The simplest approach is a post-render cheerio transform (we already import cheerio in the codebase):

In `src/converter/markdown.ts`, after `md.render()`:

```typescript
import * as cheerio from 'cheerio';

// After rendering:
let html = md.render(matterParts.content);
html = transformCallouts(html);
return html;

function transformCallouts(html: string): string {
  const $ = cheerio.load(html, { xmlMode: false });
  $('blockquote').each((_, el) => {
    const firstP = $(el).find('p').first();
    const text = firstP.text().trim();
    const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n?/i);
    if (!match) return;
    const type = match[1].toLowerCase();
    firstP.html(firstP.html()!.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](<br>)?/i, '').trim());
    $(el).addClass(`callout callout-${type}`).attr('data-callout', type);
    // Add label before content
    firstP.before(`<p class="callout-label">${match[1].toUpperCase()}</p>`);
  });
  return $('body').html() ?? html;
}
```

**Step 2:** Add CSS to `styles/markdown-pdf.css`:

```css
/* GitHub-style callouts */
.callout {
  border-left-width: 4px;
  border-left-style: solid;
  padding: 0.75em 1em;
  margin: 1em 0;
  border-radius: 0 4px 4px 0;
}
.callout-label {
  font-weight: 600;
  margin-bottom: 0.25em;
  text-transform: uppercase;
  font-size: 0.875em;
}
.callout-note    { border-color: #0969da; background: #ddf4ff; }
.callout-tip     { border-color: #1a7f37; background: #dafbe1; }
.callout-important { border-color: #8250df; background: #fbefff; }
.callout-warning { border-color: #9a6700; background: #fff8c5; }
.callout-caution { border-color: #cf222e; background: #ffebe9; }
.callout-label { color: inherit; }
```

**Step 3:** Run `tsc --noEmit` and `npm run build`.

**Step 4:** Test with all 5 callout types, export PDF, verify colours and labels.

**Step 5:** Update `README.md` Features section to mention GitHub-style callouts.

**Step 6:** Commit.

```bash
git add src/converter/markdown.ts styles/markdown-pdf.css README.md
git commit -m "feat: render GitHub-style callout blocks (> [!NOTE] etc.) (issue #364)"
```

---

## Task 8: Configurable export timeout (Issue #189)

**Priority:** Low — affects large documents. Defensive fix, small effort.

**Files:**
- Modify: `package.json` — add `markdown-pdf.timeout` setting
- Modify: `src/config/settings.ts` — expose `timeout()`
- Modify: `src/exporter/pdf.ts` — use it in `page.goto()` and `page.pdf()`

**What to do:**

Navigation timeout of 30s fails on large documents or slow machines. Raise the default and make it configurable.

**Step 1:** Add to `package.json` configuration properties:

```json
"markdown-pdf.timeout": {
  "type": "number",
  "default": 60000,
  "description": "Timeout in milliseconds for PDF export. Increase for large documents. Default: 60000 (60s)."
}
```

**Step 2:** Add to `src/config/settings.ts`:

```typescript
timeout: (resource?: vscode.Uri): number => pdf(resource).get<number>('timeout') ?? 60000,
```

**Step 3:** In `src/exporter/pdf.ts`, apply the timeout to:
- `page.goto(url, { waitUntil: 'networkidle0', timeout: config.timeout(uri) })`
- `page.pdf({ timeout: config.timeout(uri), ... })`
- The `waitForFunction` call for Mermaid polling

**Step 4:** Run `tsc --noEmit` and `npm run build`.

**Step 5:** Test: set `"markdown-pdf.timeout": 5000`, export a large document, verify timeout error message is clear. Reset to default, verify large doc succeeds.

**Step 6:** Update `README.md` settings table to add `markdown-pdf.timeout`.

**Step 7:** Commit.

```bash
git add package.json src/config/settings.ts src/exporter/pdf.ts README.md
git commit -m "feat: add markdown-pdf.timeout setting for large documents (issue #189)"
```

---

## Final Step: Update CHANGELOG and repackage

After all tasks are complete:

**Step 1:** Add entries to `changelog.md` for each fix, with issue links.

**Step 2:** Run `npm run build` and `tsc --noEmit` — confirm 0 errors.

**Step 3:** Run `npm audit --omit=dev` — confirm 0 vulnerabilities.

**Step 4:** Repackage: `npx @vscode/vsce package`

**Step 5:** Verify `.vsix` size is still under 20MB.

**Step 6:** Commit changelog + vsix metadata update.
