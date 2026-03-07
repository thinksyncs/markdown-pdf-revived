import * as vscode from 'vscode';

export function showErrorMessage(msg: string, error?: unknown): void {
  vscode.window.showErrorMessage('ERROR: ' + msg);
  console.log('ERROR: ' + msg);
  if (error) {
    vscode.window.showErrorMessage(String(error));
    console.log(error);
  }
}

export function setBooleanValue(frontmatterValue: unknown, configValue: boolean): boolean {
  if (frontmatterValue === false) return false;
  return (frontmatterValue as boolean) || configValue;
}
