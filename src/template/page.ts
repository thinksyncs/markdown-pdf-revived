import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { EXTENSION_ROOT, config } from '../config/settings';
import { readFile, isExistsDir, mkdir } from '../utils/file';
import { showErrorMessage } from '../utils/logger';

function makeCss(filename: string): string {
  try {
    const css = readFile(filename) as string;
    return css ? '\n<style>\n' + css + '\n</style>\n' : '';
  } catch (error) {
    showErrorMessage('makeCss()', error);
    return '';
  }
}

function fixHref(resource: vscode.Uri, href: string): string {
  try {
    if (!href) return href;
    const hrefUri = vscode.Uri.parse(href);
    if (['http', 'https'].includes(hrefUri.scheme)) return hrefUri.toString();
    if (href.startsWith('~')) return vscode.Uri.file(href.replace(/^~/, os.homedir())).toString();
    if (path.isAbsolute(href)) return vscode.Uri.file(href).toString();
    const root = vscode.workspace.getWorkspaceFolder(resource);
    if (!config.stylesRelativePathFile() && root) {
      return vscode.Uri.file(path.join(root.uri.fsPath, href)).toString();
    }
    return vscode.Uri.file(path.join(path.dirname(resource.fsPath), href)).toString();
  } catch (error) {
    showErrorMessage('fixHref()', error);
    return href;
  }
}

export function readStyles(uri: vscode.Uri): string {
  try {
    let style = '';
    const includeDefault = config.includeDefaultStyles();

    if (includeDefault) {
      style += makeCss(path.join(EXTENSION_ROOT, 'styles', 'markdown.css'));
    }

    if (includeDefault) {
      for (const href of config.markdownStyles()) {
        style += `<link rel="stylesheet" href="${fixHref(uri, href)}" type="text/css">`;
      }
    }

    if (config.math()) {
      const katexCss = path.join(EXTENSION_ROOT, 'node_modules', 'katex', 'dist', 'katex.min.css');
      style += `<link rel="stylesheet" href="${vscode.Uri.file(katexCss).toString()}">`;
    }

    if (config.highlight()) {
      const highlightStyle = config.highlightStyle();
      if (highlightStyle) {
        style += makeCss(path.join(EXTENSION_ROOT, 'node_modules', 'highlight.js', 'styles', highlightStyle));
      } else {
        style += makeCss(path.join(EXTENSION_ROOT, 'styles', 'tomorrow.css'));
      }
    }

    if (includeDefault) {
      style += makeCss(path.join(EXTENSION_ROOT, 'styles', 'markdown-pdf.css'));
    }

    for (const href of config.styles(uri)) {
      style += `<link rel="stylesheet" href="${fixHref(uri, href)}" type="text/css">`;
    }

    return style;
  } catch (error) {
    showErrorMessage('readStyles()', error);
    return '';
  }
}

export function makeHtml(content: string, uri: vscode.Uri): string | null {
  try {
    const style = readStyles(uri);
    const title = path.basename(uri.fsPath);
    const templatePath = path.join(EXTENSION_ROOT, 'template', 'template.html');
    const template = readFile(templatePath) as string;
    const mermaidPath = path.join(EXTENSION_ROOT, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
    const mermaidContent = readFile(mermaidPath) as string;
    const mermaid = mermaidContent ? '<script>' + mermaidContent + '</script>' : '';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mustache = require('mustache') as { render: (t: string, v: object) => string };
    return mustache.render(template, { title, style, content, mermaid });
  } catch (error) {
    showErrorMessage('makeHtml()', error);
    return null;
  }
}

export function getOutputDir(filename: string, resource?: vscode.Uri): string {
  try {
    if (!resource) return filename;
    const outputDirectory = config.outputDirectory();
    if (outputDirectory.length === 0) return filename;

    let outputDir: string;
    if (outputDirectory.startsWith('~')) {
      outputDir = outputDirectory.replace(/^~/, os.homedir());
      mkdir(outputDir);
      return path.join(outputDir, path.basename(filename));
    }

    if (path.isAbsolute(outputDirectory)) {
      if (!isExistsDir(outputDirectory)) {
        showErrorMessage(`Output directory does not exist: ${outputDirectory}`);
        return filename;
      }
      return path.join(outputDirectory, path.basename(filename));
    }

    const root = vscode.workspace.getWorkspaceFolder(resource);
    if (!config.outputDirectoryRelativePathFile() && root) {
      outputDir = path.join(root.uri.fsPath, outputDirectory);
      mkdir(outputDir);
      return path.join(outputDir, path.basename(filename));
    }

    outputDir = path.join(path.dirname(resource.fsPath), outputDirectory);
    mkdir(outputDir);
    return path.join(outputDir, path.basename(filename));
  } catch (error) {
    showErrorMessage('getOutputDir()', error);
    return filename;
  }
}
