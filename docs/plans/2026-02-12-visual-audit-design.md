# Visual Audit Tool — Design

## Problem
Claude can read CSS/HTML but can't see rendered output. "Centered in code" doesn't mean "looks centered." Need a way to screenshot sites and analyze visual composition.

## Solution
Python script + Claude Code skill. After building UI, Claude screenshots the page, generates design overlay images, reads them with vision, and reports findings.

## Architecture

```
URL → Playwright screenshot → Pillow overlay generation → Claude vision analysis
                                    ↓
                          golden-ratio.png (grid overlay)
                          full-overlay.png (all guides)
                          original.png (raw screenshot)
```

## Overlays
- **Golden ratio grid** — phi divisions (gold lines)
- **Rule of thirds** — 3x3 grid (blue lines)
- **Center lines** — crosshair (red lines)
- **Golden spiral** — Fibonacci arc approximation (orange)

## Analysis Checklist (via vision)
1. Element alignment to golden ratio / grid intersections
2. Spacing consistency between sections
3. Visual hierarchy — are important elements prominent?
4. Whitespace balance — distributed or lopsided?
5. Contrast — text readable against backgrounds?
6. Overall composition — does the eye flow naturally?

## Output
- Annotated images saved to /tmp/visual-audit/
- Text report with specific findings and suggestions

## Files
- `~/Claude/scripts/visual-audit/audit.py` — screenshot + overlay generation
- `~/Claude/skills/visual-audit/SKILL.md` — skill definition for auto-invocation

## Tech
- Python 3, Pillow (installed), Playwright via npx
- uv inline script metadata for dependency management
