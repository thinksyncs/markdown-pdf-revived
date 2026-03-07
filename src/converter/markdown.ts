import * as path from 'path';
import * as url from 'url';
import * as vscode from 'vscode';
import { EXTENSION_ROOT, config } from '../config/settings';
import { readFile } from '../utils/file';
import { showErrorMessage, setBooleanValue } from '../utils/logger';
import { slug } from './slug';
import { markdownItKaTeX } from './katex';

function convertImgPath(src: string, filename: string): string {
  try {
    let href = decodeURIComponent(src)
      .replace(/("|')/g, '')
      .replace(/\\/g, '/')
      .replace(/#/g, '%23');
    const protocol = url.parse(href).protocol;
    if (protocol === 'file:' && !href.startsWith('file:///')) {
      return href.replace(/^file:\/\//, 'file:///');
    } else if (protocol === 'file:') {
      return href;
    } else if (!protocol || path.isAbsolute(href)) {
      href = path.resolve(path.dirname(filename), href)
        .replace(/\\/g, '/')
        .replace(/#/g, '%23');
      if (href.startsWith('//')) return 'file:' + href;
      if (href.startsWith('/')) return 'file://' + href;
      return 'file:///' + href;
    }
    return src;
  } catch (error) {
    showErrorMessage('convertImgPath()', error);
    return src;
  }
}

export function convertMarkdownToHtml(filename: string, type: string, text: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const grayMatter = require('gray-matter') as (s: string) => { data: Record<string, unknown>; content: string };
  const matterParts = grayMatter(text);

  let statusbarMessage: vscode.Disposable | undefined;
  try {
    try {
      statusbarMessage = vscode.window.setStatusBarMessage('$(markdown) Converting (convertMarkdownToHtml) ...');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const hljs = require('highlight.js') as { getLanguage: (l: string) => unknown; highlight: (l: string, s: string, b: boolean) => { value: string } };
      const breaks = setBooleanValue(matterParts.data['breaks'], config.breaks());

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
      const MarkdownIt = require('markdown-it') as new (opts: object) => any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md: any = new MarkdownIt({
        html: true,
        breaks,
        highlight: function (str: string, lang: string): string {
          if (lang && lang.match(/\bmermaid\b/i)) {
            return `<div class="mermaid">${str}</div>`;
          }
          if (lang && hljs.getLanguage(lang)) {
            try {
              str = hljs.highlight(lang, str, true).value;
            } catch (error) {
              str = md.utils.escapeHtml(str);
              showErrorMessage('markdown-it:highlight', error);
            }
          } else {
            str = md.utils.escapeHtml(str);
          }
          return '<pre class="hljs"><code><div>' + str + '</div></code></pre>';
        },
      });

      // Image path conversion
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cheerio = require('cheerio') as { load: (s: string) => import('cheerio').CheerioAPI };
      const defaultRender = md.renderer.rules['image'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      md.renderer.rules['image'] = function (tokens: any[], idx: number, options: object, env: unknown, self: any): string {
        const token = tokens[idx];
        let href = token.attrs[token.attrIndex('src')][1] as string;
        if (type === 'html') {
          href = decodeURIComponent(href).replace(/("|')/g, '');
        } else {
          href = convertImgPath(href, filename);
        }
        token.attrs[token.attrIndex('src')][1] = href;
        return defaultRender ? defaultRender(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options) as string;
      };

      if (type !== 'html') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md.renderer.rules['html_block'] = function (tokens: any[], idx: number): string {
          const html = tokens[idx].content as string;
          const $ = cheerio.load(html);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $('img').each(function (_i: number, elem: any) {
            const src = $(elem).attr('src') ?? '';
            $(elem).attr('src', convertImgPath(src, filename));
          });
          return $.html();
        };
      }

      // Plugins
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      md.use(require('markdown-it-checkbox'));

      const emojiEnabled = setBooleanValue(matterParts.data['emoji'], config.emoji());
      if (emojiEnabled) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const emojiesDefs = require(path.join(EXTENSION_ROOT, 'data', 'emoji.json')) as Record<string, string>;
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        md.use((require('markdown-it-emoji') as { full: import('markdown-it').PluginSimple }).full, { defs: emojiesDefs });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md.renderer.rules['emoji'] = function (token: any[], idx: number): string {
          const emoji = token[idx].markup as string;
          const emojipath = path.join(EXTENSION_ROOT, 'node_modules', 'emoji-images', 'pngs', emoji + '.png');
          const emojidata = (readFile(emojipath, null) as Buffer).toString('base64');
          if (emojidata) {
            return `<img class="emoji" alt="${emoji}" src="data:image/png;base64,${emojidata}" />`;
          }
          return ':' + emoji + ':';
        };
      }

      if (setBooleanValue(matterParts.data['math'], config.math())) {
        md.use(markdownItKaTeX);
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      md.use(require('markdown-it-anchor'), { slugify: slug, permalink: false });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      md.use(require('markdown-it-container'), '', {
        validate: (name: string) => name.trim().length > 0,
        render: (tokens: { info: string; nesting: number }[], idx: number) => {
          if (tokens[idx].info.trim() !== '') {
            return `<div class="${tokens[idx].info.trim()}">\n`;
          }
          return '</div>\n';
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      md.use(require('markdown-it-include'), {
        root: path.dirname(filename),
        includeRe: /:\[.+\]\((.+\..+)\)/i,
      });

      statusbarMessage.dispose();
      return md.render(matterParts.content);

    } catch (error) {
      statusbarMessage?.dispose();
      showErrorMessage('convertMarkdownToHtml()', error);
      return undefined;
    }
  } catch (error) {
    statusbarMessage?.dispose();
    showErrorMessage('convertMarkdownToHtml()', error);
    return undefined;
  }
}
