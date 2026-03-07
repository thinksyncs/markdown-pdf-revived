# Code & Syntax Highlighting Test

## Inline Code

Use `npm install` to install dependencies. Reference `extension.js` for the entry point.

## Fenced Code Blocks

### JavaScript
```javascript
async function exportPdf(data, filename, type, uri) {
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: '/path/to/chrome' });
  const page = await browser.newPage();
  await page.goto(`file://${filename}`, { waitUntil: 'networkidle0' });
  await page.pdf({ path: filename, format: 'A4' });
  await browser.close();
}
```

### TypeScript
```typescript
interface ExportOptions {
  format: 'A4' | 'Letter' | 'A3';
  orientation: 'portrait' | 'landscape';
  margin: { top: string; bottom: string; left: string; right: string };
  printBackground: boolean;
}
```

### Python
```python
def convert_markdown(input_path: str, output_path: str) -> None:
    with open(input_path, 'r') as f:
        content = f.read()
    # process content
    with open(output_path, 'w') as f:
        f.write(content)
```

### Shell
```bash
npm install
npm audit --omit=dev
git add -A && git commit -m "feat: phase complete"
```

### JSON
```json
{
  "name": "markdown-pdf",
  "version": "2.0.0",
  "dependencies": {
    "puppeteer-core": "^24.38.0",
    "katex": "^0.16.37"
  }
}
```

### No language (plain)
```
Plain preformatted text
No syntax highlighting applied
```
