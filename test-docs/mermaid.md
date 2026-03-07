# Mermaid Diagrams Test

Mermaid renders locally from bundled node_modules — no CDN, no internet required.

## Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is Chrome installed?}
    B -->|Yes| C[Load extension]
    B -->|No| D[Show error message]
    C --> E[Open markdown file]
    E --> F[Run export command]
    F --> G[Sanitize HTML]
    G --> H[Render via Puppeteer]
    H --> I[Save PDF/HTML]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant VSCode
    participant Extension
    participant Puppeteer
    participant Chrome

    User->>VSCode: Open markdown file
    User->>VSCode: Run Export PDF command
    VSCode->>Extension: markdownPdf('pdf')
    Extension->>Extension: convertMarkdownToHtml()
    Extension->>Extension: sanitizeContent() [DOMPurify]
    Extension->>Extension: makeHtml() [inject Mermaid + KaTeX]
    Extension->>Puppeteer: launch Chrome
    Puppeteer->>Chrome: goto(tmpfile.html)
    Chrome-->>Puppeteer: page loaded + Mermaid rendered
    Puppeteer->>Chrome: page.pdf()
    Chrome-->>Puppeteer: PDF buffer
    Puppeteer-->>Extension: done
    Extension-->>User: output.pdf saved
```

## Class Diagram

```mermaid
classDiagram
    class Extension {
        +activate(context)
        +deactivate()
        -markdownPdf(type)
        -init()
    }
    class Converter {
        +convertMarkdownToHtml(filename, type, text)
        +makeHtml(data, uri)
        +sanitizeContent(html)
    }
    class Exporter {
        +exportPdf(data, filename, type, uri)
        +exportHtml(data, filename)
    }
    Extension --> Converter
    Extension --> Exporter
```

## Gantt Chart

```mermaid
gantt
    title Markdown PDF (Revived) - Phase 1 Schedule
    dateFormat  YYYY-MM-DD
    section Phase 1.2
    Remove PlantUML       :done, p12, 2026-03-07, 1d
    section Phase 1.3
    Remove PNG/JPEG       :done, p13, after p12, 1d
    section Phase 1.4
    Update dependencies   :done, p14, after p13, 1d
    section Phase 1.5
    CVE-2024-7739 fix     :done, p15, after p14, 1d
    section Phase 1.6
    Verification          :active, p16, after p15, 1d
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Converting: Export command triggered
    Converting --> Sanitizing: Markdown rendered to HTML
    Sanitizing --> BuildingTemplate: DOMPurify passed
    Sanitizing --> Error: DOMPurify failed
    BuildingTemplate --> Exporting: Template compiled
    Exporting --> Done: File saved
    Exporting --> Error: Puppeteer error
    Done --> Idle
    Error --> Idle
```
