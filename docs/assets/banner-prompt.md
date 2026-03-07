# Banner Generation Prompt — Markdown PDF (AUAggy fork)

**Target:** 1280×640px PNG, VSCode Marketplace gallery banner
**Tool:** Google Imagen / Nano Banana or equivalent

---

## Prompt

Create a clean, minimal marketplace banner at 1280×640 pixels.

**Canvas:** Solid dark background, color #111827 (dark navy-charcoal). No gradients, no textures, no patterns, no noise. Flat solid color only.

**Left side (roughly left 55% of canvas):**

Large primary text: **"Markdown PDF"**
- Font weight: bold or semibold geometric sans-serif (Inter, SF Pro, or equivalent clean system font)
- Color: white (#FFFFFF)
- Font size: approximately 96px
- Positioned vertically centered, with ~80px left margin

Secondary text directly below, with ~16px gap:
**"Markdown to PDF and HTML. Local. Offline. No telemetry."**
- Color: medium gray (#9CA3AF)
- Font size: approximately 28px
- Same left alignment as the title

Publisher text below that, with ~32px gap:
**"AUAggy"**
- Color: dim gray (#6B7280)
- Font size: approximately 22px
- Same left alignment

**Right side (roughly right 45% of canvas):**

The extension icon, redrawn at approximately 200×200px, centered vertically and horizontally in the right half:
- White square with rounded corners
- Black circular border
- Inside: "M↓" Markdown mark (black on white, thin rounded rectangle border) in upper half
- Inside: "PDF" badge (white text on red #CC0000 rectangle) in lower half

No other elements. No decorations, no feature bullets, no screenshots, no code snippets.

**Style constraints:**
- Dark background only (#111827). Do not use pure black (#000000).
- No gradients anywhere.
- No border or frame around the banner canvas.
- No decorative lines, dividers, or geometric shapes beyond the icon itself.
- The icon on the right should have slight breathing room — do not crop or touch the canvas edge.
- Text must be left-aligned, not centered across the full canvas.

**Color palette (strict):**
- Background: #111827
- Title text: #FFFFFF
- Subtitle text: #9CA3AF
- Publisher text: #6B7280
- Icon: white, black (#000000), red (#CC0000)

**Output:** PNG, 1280×640px.

---

## Rationale

The banner is a billboard. At marketplace scroll speed, only the name and the icon register. The dark background separates it from the white-heavy marketplace page chrome. The subtitle answers the one question a potential user has ("what does this do?") in one line. No feature marketing, no screenshots — those are already in the README below the banner.
