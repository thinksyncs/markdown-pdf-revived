import type MarkdownIt from 'markdown-it';

// Minimal KaTeX plugin for markdown-it.
// Avoids third-party plugins with pinned (potentially vulnerable) katex versions.
// Supports $...$ (inline) and $$...$$ (block/display) math.
export function markdownItKaTeX(md: MarkdownIt): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const katex = require('katex') as { renderToString: (s: string, o: object) => string };

  // Inline math: $...$
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  md.inline.ruler.before('escape', 'math_inline', function (state: any, silent: boolean): boolean {
    const src = state.src as string;
    const start = state.pos as number;
    if (src[start] !== '$' || src[start + 1] === '$') return false;
    const end = src.indexOf('$', start + 1);
    if (end === -1) return false;
    if (!silent) {
      const token = state.push('math_inline', '', 0);
      token.markup = '$';
      token.content = src.slice(start + 1, end);
    }
    state.pos = end + 1;
    return true;
  });

  // Block math: $$...$$ (single-line or multi-line)
  md.block.ruler.before(
    'fence',
    'math_block',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (state: any, startLine: number, endLine: number, silent: boolean): boolean {
      let pos = (state.bMarks[startLine] as number) + (state.tShift[startLine] as number);
      let max = state.eMarks[startLine] as number;
      if (max - pos < 4 || (state.src as string).slice(pos, pos + 2) !== '$$') return false;

      const lineContent = (state.src as string).slice(pos + 2, max);
      const closeIdx = lineContent.indexOf('$$');

      if (closeIdx !== -1) {
        // Single-line: $$formula$$
        if (silent) return true;
        const token = state.push('math_block', '', 0);
        token.block = true;
        token.markup = '$$';
        token.content = lineContent.slice(0, closeIdx).trim();
        state.line = startLine + 1;
        return true;
      }

      // Multi-line: opening $$ on one line, closing $$ on another
      const firstLineContent = lineContent.trim();
      let found = false;
      let nextLine = startLine;
      while (nextLine < endLine) {
        nextLine++;
        pos = (state.bMarks[nextLine] as number) + (state.tShift[nextLine] as number);
        max = state.eMarks[nextLine] as number;
        if (max - pos >= 2 && (state.src as string).slice(pos, pos + 2) === '$$') {
          found = true;
          break;
        }
      }
      if (!found) return false;
      if (silent) return true;

      let blockContent = (state.getLines(startLine + 1, nextLine, 0, true) as string).trim();
      if (firstLineContent) blockContent = firstLineContent + '\n' + blockContent;

      const token = state.push('math_block', '', 0);
      token.block = true;
      token.markup = '$$';
      token.content = blockContent;
      state.line = nextLine + 1;
      return true;
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  md.renderer.rules['math_inline'] = function (tokens: any[], idx: number): string {
    try {
      return katex.renderToString(tokens[idx].content as string, { throwOnError: false });
    } catch {
      return tokens[idx].content as string;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  md.renderer.rules['math_block'] = function (tokens: any[], idx: number): string {
    try {
      return '<p>' + katex.renderToString(tokens[idx].content as string, { throwOnError: false, displayMode: true }) + '</p>\n';
    } catch {
      return '<p>' + (tokens[idx].content as string) + '</p>\n';
    }
  };
}
