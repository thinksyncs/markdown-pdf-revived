# Icon Generation Prompt — Markdown PDF (AUAggy fork)

**Target:** 128×128px PNG, VSCode Marketplace extension icon
**Tool:** Google Imagen / Nano Banana or equivalent

---

## Prompt

Create a flat, minimal app icon at 128×128 pixels with the following exact specifications:

**Canvas:** White square background (#FFFFFF) with slightly rounded corners (12px radius). No drop shadows, no gradients, no textures.

**Composition:** A single thick black circle (stroke width ~6px, no fill) centered on the canvas with ~12px padding from each edge. Everything lives inside this circle.

**Inside the circle, two elements stacked vertically, centered:**

**Top element — Markdown mark:**
A thin black rounded-rectangle border (stroke only, no fill, ~4px stroke, ~8px corner radius), approximately 60% of the circle width and 40% of the circle height, positioned in the upper half of the circle with ~8px gap from the circle edge. Inside this rectangle, the standard Markdown logo: a bold capital letter "M" on the left, and a thick downward-pointing arrow "↓" on the right. Both glyphs in solid black, clean geometric sans-serif weight.

**Bottom element — PDF badge:**
A solid red rectangle (#CC0000), same width as the Markdown rectangle above, approximately 28% of the circle height, positioned in the lower half of the circle with ~8px gap from the circle edge and ~6px gap between it and the Markdown rectangle above. Inside: the word "PDF" in bold, white (#FFFFFF), clean geometric sans-serif, centered horizontally and vertically.

**Style constraints:**
- Flat design only. No gradients, no bevels, no shadows, no gloss.
- Exactly three colors: white (#FFFFFF), black (#000000), red (#CC0000).
- All edges crisp and clean — this must read clearly at 16×16px.
- No additional decorative elements, no background patterns, no effects.

**Output:** PNG, 128×128px, transparent background acceptable but white preferred.

---

## Reference Description

The original `yzane.markdown-pdf` icon uses this same visual language. This is a redrawn version — same composition, same color family, same motifs — created as original artwork for the `AUAggy.markdown-pdf` fork.
