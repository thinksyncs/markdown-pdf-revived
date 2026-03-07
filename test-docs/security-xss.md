# Security / XSS Test

This document tests that DOMPurify correctly strips malicious content while
preserving all legitimate markdown output. Export this file and verify:
- No alerts fire
- No console errors about XSS
- All legitimate content below renders correctly

## XSS Payloads (should all be stripped/escaped)

Inline script attempt: <script>alert('XSS-1')</script>

Image onerror: <img src="x" onerror="alert('XSS-2')">

Iframe attempt: <iframe src="javascript:alert('XSS-3')"></iframe>

Object embed: <object data="javascript:alert('XSS-4')"></object>

Event in link: <a href="#" onclick="alert('XSS-5')">click me</a>

SVG with script: <svg><script>alert('XSS-6')</script></svg>

Base tag injection: <base href="javascript:alert('XSS-7')//">

## Legitimate Content (should all render correctly)

### Normal link
[Visit example](https://example.com)

### Normal image reference
![Alt text](./images/icon.png)

### Code block (script inside should NOT execute — it's code, not HTML)
```html
<script>alert('this is code, not live')</script>
```

### Inline code
`<script>alert('also safe inline code')</script>`

### Bold and italic
**Bold text** and *italic text* and ***both***.

### Blockquote with angle brackets
> The formula is: x < y > z

### Table
| Input | Sanitized | Safe |
|-------|-----------|------|
| `<script>` | stripped | yes |
| `onclick=` | stripped | yes |
| `<b>bold</b>` | kept | yes |
| `<div>` | kept | yes |
