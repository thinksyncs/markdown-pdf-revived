import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { config } from '../config/settings';
import { isExistsPath } from '../utils/file';
import { showErrorMessage } from '../utils/logger';
import { exportHtml } from './html';
import { getOutputDir, readUserStylesAsText } from '../template/page';

// Set to true once Chrome/Chromium is confirmed present at activation time.
let chromiumReady = false;

export function markChromiumReady(): void {
  chromiumReady = true;
}

export function getChromiumDefaultPaths(): string[] {
  if (process.platform === 'win32') {
    return [
      (process.env['LOCALAPPDATA'] ?? '') + '\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      (process.env['LOCALAPPDATA'] ?? '') + '\\Chromium\\Application\\chrome.exe',
    ];
  } else if (process.platform === 'darwin') {
    return [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
  } else {
    return [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ];
  }
}

export function checkPuppeteerBinary(): boolean {
  try {
    const executablePath = config.executablePath();
    if (executablePath && isExistsPath(executablePath)) {
      markChromiumReady();
      return true;
    }
    for (const p of getChromiumDefaultPaths()) {
      if (isExistsPath(p)) {
        markChromiumReady();
        return true;
      }
    }
    return false;
  } catch (error) {
    showErrorMessage('checkPuppeteerBinary()', error);
    return false;
  }
}

function transformTemplate(templateText: string): string {
  return templateText
    .replace('%%ISO-DATETIME%%', new Date().toISOString().substring(0, 19).replace('T', ' '))
    .replace('%%ISO-DATE%%', new Date().toISOString().substring(0, 10))
    .replace('%%ISO-TIME%%', new Date().toISOString().substring(11, 19));
}

export async function exportPdf(
  data: string,
  filename: string,
  type: string,
  uri: vscode.Uri
): Promise<void> {
  if (!chromiumReady) return;
  if (!checkPuppeteerBinary()) {
    showErrorMessage('Chromium or Chrome does not exist! See https://github.com/yzane/vscode-markdown-pdf#install');
    return;
  }

  vscode.window.setStatusBarMessage('');
  const exportFilename = getOutputDir(filename, uri);

  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: `[Markdown PDF]: Exporting (${type}) ...` },
    async () => {
      let tempDir: string | undefined;
      try {
        if (type === 'html') {
          exportHtml(data, exportFilename);
          vscode.window.setStatusBarMessage('$(markdown) ' + exportFilename, 10000);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const puppeteer = require('puppeteer-core') as typeof import('puppeteer-core');
        const f = path.parse(filename);
        // Always stage in a unique temp directory to avoid predictable filenames
        // and symlink-traversal issues when writing temporary HTML.
        const tempParent = os.tmpdir();
        tempDir = fs.mkdtempSync(path.join(tempParent, 'markdown-pdf-'));
        const tmpfilename = path.join(tempDir, `${f.name}.html`);
        fs.writeFileSync(tmpfilename, data, { encoding: 'utf8', flag: 'wx' });

        // Resolve Chrome: user setting → auto-detected system Chrome
        let execPath = config.executablePath();
        if (!execPath || !isExistsPath(execPath)) {
          for (const p of getChromiumDefaultPaths()) {
            if (isExistsPath(p)) { execPath = p; break; }
          }
        }

        const browser = await puppeteer.launch({
          executablePath: execPath,
          args: ['--lang=' + vscode.env.language, '--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setDefaultTimeout(0);
        await page.goto(vscode.Uri.file(tmpfilename).toString(), { waitUntil: 'networkidle0', timeout: config.timeout(uri) });

        // PR #399: wait for Mermaid async SVG rendering before PDF capture.
        // The callbacks run in the browser context — document is available there.
        const hasMermaid = await page.evaluate(
          /* eslint-disable-next-line @typescript-eslint/no-implied-eval */
          '() => document.querySelectorAll(".mermaid").length > 0'
        ) as boolean;
        if (hasMermaid) {
          await page.waitForFunction(
            '() => document.querySelectorAll(".mermaid:not([data-processed])").length === 0',
            { timeout: config.timeout(uri) }
          ).catch(() => { /* timeout — best-effort render */ });
        }

        if (type === 'pdf') {
          const margin = config.margin(uri);
          const userCss = readUserStylesAsText(uri);
          const headerFooterStyle = userCss ? `<style>${userCss}</style>` : '';
          await page.pdf({
            path: exportFilename,
            displayHeaderFooter: config.displayHeaderFooter(uri),
            headerTemplate: headerFooterStyle + transformTemplate(config.headerTemplate(uri)),
            footerTemplate: headerFooterStyle + transformTemplate(config.footerTemplate(uri)),
            printBackground: config.printBackground(uri),
            landscape: config.orientation(uri) === 'landscape',
            format: config.format(uri) as 'A4',
            margin: { top: margin.top || undefined, right: margin.right || undefined, bottom: margin.bottom || undefined, left: margin.left || undefined },
            timeout: config.timeout(uri),
          });
        }

        await browser.close();

        vscode.window.setStatusBarMessage('$(markdown) ' + exportFilename, 10000);
      } catch (error) {
        showErrorMessage('exportPdf()', error);
      } finally {
        if (tempDir) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      }
    }
  );
}
