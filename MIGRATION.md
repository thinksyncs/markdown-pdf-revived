# Migrating from yzane.markdown-pdf

This guide covers changes between the original `yzane.markdown-pdf` and `AUAggy.markdown-pdf` v2.0.0.

## Removed Features

| Feature | Status | Alternative |
|---|---|---|
| PlantUML diagrams | Removed | Use Mermaid (see below) |
| PNG export | Removed | PDF/HTML only |
| JPEG export | Removed | PDF/HTML only |
| Chromium auto-download | Removed | Install Chrome or Chromium manually |

## Removed Settings

Remove these from `settings.json`. They no longer exist.

| Setting | Replacement |
|---|---|
| `markdown-pdf.scale` | Not configurable (fixed at 1) |
| `markdown-pdf.pageRanges` | Not configurable (always all pages) |
| `markdown-pdf.width` | Use `markdown-pdf.format` instead |
| `markdown-pdf.height` | Use `markdown-pdf.format` instead |
| `markdown-pdf.includeDefaultStyles` | Always enabled |
| `markdown-pdf.stylesRelativePathFile` | Removed; relative paths resolve from workspace root |
| `markdown-pdf.outputDirectoryRelativePathFile` | Removed; relative paths resolve from workspace root |
| `markdown-pdf.StatusbarMessageTimeout` | Not configurable (fixed at 10s) |
| `markdown-pdf.debug` | Not configurable |
| `markdown-pdf.markdown-it-include.enable` | Always enabled |

## Changed Defaults

| Setting | Old Default | New Default |
|---|---|---|
| `markdown-pdf.highlightStyle` | `""` (tomorrow.css) | `"github.css"` |
| `markdown-pdf.displayHeaderFooter` | `true` | `false` |
| `markdown-pdf.margin.top` | `1.5cm` | `2cm` |
| `markdown-pdf.margin.bottom` | `1cm` | `2cm` |
| `markdown-pdf.margin.right` | `1cm` | `2.5cm` |
| `markdown-pdf.margin.left` | `1cm` | `2.5cm` |

## PlantUML to Mermaid

PlantUML has been removed. Diagram source was sent to `plantuml.com` on each render, creating a hard dependency on external infrastructure and a privacy concern.

Mermaid covers the same diagram types and renders locally.

| Diagram Type | PlantUML | Mermaid |
|---|---|---|
| Sequence | `@startuml`<br>`Alice -> Bob: Hello`<br>`@enduml` | ` ```mermaid`<br>`sequenceDiagram`<br>`Alice->>Bob: Hello`<br>` ``` ` |
| Flowchart | `@startuml`<br>`start`<br>`:step;`<br>`stop`<br>`@enduml` | ` ```mermaid`<br>`flowchart TD`<br>`A[Start] --> B[Step]`<br>` ``` ` |
| State | `@startuml`<br>`[*] --> State1`<br>`@enduml` | ` ```mermaid`<br>`stateDiagram`<br>`[*] --> State1`<br>` ``` ` |
| Class | `@startuml`<br>`class User`<br>`@enduml` | ` ```mermaid`<br>`classDiagram`<br>`class User`<br>` ``` ` |
| Gantt | `@startuml`<br>`gantt`<br>`@enduml` | ` ```mermaid`<br>`gantt`<br>`title Project`<br>` ``` ` |

Full Mermaid syntax reference: https://mermaid.js.org/

## Chrome Requirement

The original extension attempted to download Chromium automatically. That API (`createBrowserFetcher`) was removed in puppeteer v20. This extension detects system Chrome automatically on macOS, Linux, and Windows at standard installation paths.

If Chrome is not detected at startup, an error message appears with instructions. To specify a custom executable path:

```json
"markdown-pdf.executablePath": "/path/to/chrome"
```
