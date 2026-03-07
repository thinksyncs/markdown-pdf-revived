import * as fs from 'fs';
import { showErrorMessage } from '../utils/logger';

export function exportHtml(data: string, filename: string): void {
  fs.writeFile(filename, data, 'utf-8', function (error) {
    if (error) {
      showErrorMessage('exportHtml()', error);
    }
  });
}
