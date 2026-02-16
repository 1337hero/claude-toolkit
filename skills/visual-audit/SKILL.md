---
name: visual-audit
description: Screenshot websites and analyze visual composition against design principles (golden ratio, rule of thirds, spacing, hierarchy). Use after building or modifying UI components to verify visual quality before presenting to user.
---

# Visual Audit

Screenshot a website and analyze its visual composition against established design principles.

## When to Use

- After building or significantly modifying a frontend component/page
- When the user asks to check how something looks
- Before presenting UI work as complete

## Workflow

1. **Determine the URL** -- dev server, usually `localhost:<port>`. Check running processes or ask the user.
2. **Run the audit script:**
   ```bash
   python3 ~/Claude/scripts/visual-audit/audit.py <url> [--width 1920] [--height 1080] [--full-page]
   ```
3. **Read the generated images** using the Read tool:
   - Read `original.png` first to see the actual rendered page
   - Read `full-overlay.png` to see the design grid analysis
   - Optionally read `golden-ratio.png` for focused golden ratio analysis
4. **Analyze** against the visual audit checklist below
5. **Report findings** with annotated image paths and a text summary of issues

## Visual Audit Checklist

1. **Golden Ratio Alignment** -- Do key elements (hero, CTA, images) align with golden ratio intersections?
2. **Spacing Consistency** -- Are margins/padding consistent between similar elements?
3. **Visual Hierarchy** -- Is importance communicated through size, weight, color, position?
4. **Whitespace Balance** -- Is negative space distributed intentionally, not randomly?
5. **Contrast & Readability** -- Is text readable? Sufficient contrast between elements?
6. **Composition Flow** -- Does the eye follow a natural path (ideally along the golden spiral)?
7. **Alignment** -- Are elements that should be aligned actually aligned?
8. **Responsive Concerns** -- At this viewport, does anything overflow, collapse, or look cramped?

## Report Format

```
## Visual Audit: [page/component name]

**Screenshots:** [paths to generated images]

### Findings
- [specific observation with location reference]
- [specific observation with location reference]

### Suggestions
- [actionable fix with specificity]
```

## Important Notes

- Always screenshot BEFORE making changes so you can compare before/after
- If the dev server is not running, do not start one without asking
- Multiple viewport sizes are useful for responsive checks:
  - Desktop: 1920x1080
  - Tablet: 768x1024
  - Mobile: 375x812
- The overlay images are guides, not gospel -- visual design is subjective, use them to inform analysis not dictate it
