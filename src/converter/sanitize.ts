import { showErrorMessage } from '../utils/logger';

// Sanitize user-supplied HTML to prevent XSS (CVE-2024-7739).
// Only markdown-rendered content is sanitized — not trusted internal assets
// (inlined Mermaid script, KaTeX/hljs stylesheets, etc.).
//
// Config rationale:
//   FORCE_BODY      – treat input as a body fragment, not a full document
//   ALLOW_DATA_ATTR – preserve data-* attributes used by Mermaid
//   ADD_TAGS        – allow <svg> and MathML elements so KaTeX renders correctly
//   FORBID_TAGS     – explicitly block <script>, <iframe>, <object> in user content
//   FORBID_ATTR     – block all inline event handlers (onclick, onerror, etc.)
//   Fail-closed: returns null on error → export is blocked entirely
export function sanitizeContent(html: string): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createDOMPurify = require('dompurify') as (window: Window) => { sanitize: (s: string, o: object) => string };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require('jsdom') as { JSDOM: new (html: string) => { window: Window } };
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window as unknown as Window);
    return DOMPurify.sanitize(html, {
      FORCE_BODY: true,
      ALLOW_DATA_ATTR: true,
      ADD_TAGS: ['svg', 'math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac',
        'mover', 'munder', 'munderover', 'mtext', 'mtable', 'mtr', 'mtd',
        'semantics', 'annotation'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
        'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup',
        'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove'],
    });
  } catch (error) {
    showErrorMessage('sanitizeContent(): HTML sanitization failed — export blocked for safety.', error);
    return null;
  }
}
