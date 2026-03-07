import * as path from 'path';
import * as vscode from 'vscode';
import * as os from 'os';

// All asset paths (styles/, template/, data/, node_modules/) are relative to
// the extension root. The bundle lives in dist/, so we go one level up.
export const EXTENSION_ROOT = path.join(__dirname, '..');

function pdf(resource?: vscode.Uri) {
  return vscode.workspace.getConfiguration('markdown-pdf', resource);
}

function md() {
  return vscode.workspace.getConfiguration('markdown');
}

export const config = {
  type: (): string[] => pdf().get<string[]>('type') ?? ['pdf'],
  convertOnSave: (): boolean => pdf().get<boolean>('convertOnSave') ?? false,
  convertOnSaveExclude: (): string[] => pdf().get<string[]>('convertOnSaveExclude') ?? [],
  outputDirectory: (): string => pdf().get<string>('outputDirectory') ?? '',
  outputDirectoryRelativePathFile: (): boolean => pdf().get<boolean>('outputDirectoryRelativePathFile') ?? false,
  styles: (resource?: vscode.Uri): string[] => pdf(resource).get<string[]>('styles') ?? [],
  stylesRelativePathFile: (): boolean => pdf().get<boolean>('stylesRelativePathFile') ?? false,
  includeDefaultStyles: (): boolean => pdf().get<boolean>('includeDefaultStyles') ?? true,
  highlight: (): boolean => pdf().get<boolean>('highlight') ?? true,
  highlightStyle: (): string => pdf().get<string>('highlightStyle') ?? '',
  breaks: (): boolean => pdf().get<boolean>('breaks') ?? false,
  emoji: (): boolean => pdf().get<boolean>('emoji') ?? true,
  math: (): boolean => pdf().get<boolean>('math') ?? true,
  executablePath: (): string => pdf().get<string>('executablePath') ?? '',
  scale: (resource?: vscode.Uri): number => pdf(resource).get<number>('scale') ?? 1,
  displayHeaderFooter: (resource?: vscode.Uri): boolean => pdf(resource).get<boolean>('displayHeaderFooter') ?? true,
  headerTemplate: (resource?: vscode.Uri): string => pdf(resource).get<string>('headerTemplate') ?? '',
  footerTemplate: (resource?: vscode.Uri): string => pdf(resource).get<string>('footerTemplate') ?? '',
  printBackground: (resource?: vscode.Uri): boolean => pdf(resource).get<boolean>('printBackground') ?? true,
  orientation: (resource?: vscode.Uri): string => pdf(resource).get<string>('orientation') ?? 'portrait',
  pageRanges: (resource?: vscode.Uri): string => pdf(resource).get<string>('pageRanges') ?? '',
  format: (resource?: vscode.Uri): string => pdf(resource).get<string>('format') ?? 'A4',
  width: (resource?: vscode.Uri): string => pdf(resource).get<string>('width') ?? '',
  height: (resource?: vscode.Uri): string => pdf(resource).get<string>('height') ?? '',
  margin: (resource?: vscode.Uri) => {
    const m = pdf(resource).get<Record<string, string>>('margin') ?? {};
    return { top: m['top'] ?? '', right: m['right'] ?? '', bottom: m['bottom'] ?? '', left: m['left'] ?? '' };
  },
  statusbarMessageTimeout: (): number => pdf().get<number>('StatusbarMessageTimeout') ?? 10000,
  markdownItIncludeEnable: (): boolean => pdf().get<boolean>('markdown-it-include.enable') ?? true,
  debug: (): boolean => pdf().get<boolean>('debug') ?? false,
  markdownStyles: (): string[] => md().get<string[]>('styles') ?? [],
  homedir: (): string => os.homedir(),
};
