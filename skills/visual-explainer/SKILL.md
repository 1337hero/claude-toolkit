---
name: visual-explainer
description: Convert terminal output, structured data, and complex information into beautiful standalone HTML pages with diagrams, tables, dashboards, and visual comparisons. Use instead of ASCII tables, text comparisons, or any structured output that would be clearer as a visual. Triggers on diff reviews, plan reviews, project recaps, architecture diagrams, and any "show me" request.
---

# Visual Explainer

Generate self-contained HTML pages instead of terminal output whenever the information would be clearer visually.

## Core Principle

> When you're about to present tabular data as ASCII boxes, generate an HTML page instead.

**Replace with HTML:**
- Comparison tables (before/after, option A vs B)
- Architecture diagrams (system components, data flow)
- Audit results, status reports, feature matrices
- Code review summaries
- Project recaps and status dashboards
- Any structured rows/columns of data

## Workflow

### 1. Think strategically first (before any code)

- **Audience**: who reads this and what decision does it support?
- **Diagram type**: which visual structure fits the content? (see Diagram Types below)
- **Aesthetic direction**: pick a palette and font before opening `<style>`
- **Layout**: sketch the hierarchy — hero section, supporting panels, reference material

### 2. Select diagram type

| Content type | Approach |
|---|---|
| System architecture | Mermaid flowchart or CSS card grid |
| Data flow / pipeline | Mermaid sequence or CSS pipeline |
| Before/after comparison | Side-by-side panels (red/green) |
| Metrics dashboard | KPI cards + sparklines |
| Status report | Table with color-coded status badges |
| Decision tree | Mermaid flowchart |
| Timeline | CSS timeline or Mermaid gantt |
| Schema / ER diagram | Mermaid erDiagram |
| Mind map | Mermaid mindmap |
| Dependency graph | Mermaid graph LR |

### 3. Style with intention

- Pick **one real font** (not Inter/Roboto/system-ui) — reference Google Fonts CDN
- Establish **semantic CSS variables** for `--bg`, `--surface`, `--text`, `--accent`, `--accent-dim`
- Add a **theme toggle** (dark default, light option) — use `data-theme` on `<html>`
- Use **background depth**: radial gradients, subtle dot grids, or diagonal patterns
- Limit animations to **1-2 high-impact moments** with `prefers-reduced-motion` fallback

### 4. Structure the HTML

Required elements:
- `<!DOCTYPE html>` with `lang="en"`
- CSS variables for theming in `:root` and `[data-theme="light"]`
- Sticky or fixed navigation for sections longer than one screen
- Responsive single breakpoint at `768px`
- `min-width: 0` on ALL grid/flex children (overflow protection)
- Theme toggle button

### 5. Deliver

Write the file to `~/.agent/diagrams/<descriptive-name>.html` then open it:
```bash
mkdir -p ~/.agent/diagrams
# write file, then:
xdg-open ~/.agent/diagrams/<name>.html
```

---

## Design Patterns

See `~/Claude/skills/visual-explainer/references/css-patterns.md` for complete CSS patterns including:
- Theme system (CSS variables)
- Node/card variants (elevated, recessed, hero, glass)
- Overflow protection
- Mermaid zoom controls
- KPI metric cards
- Before/after diff panels
- Staggered animations

### Mermaid setup

Always include this config before diagrams:
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({
    startOnLoad: true,
    theme: document.documentElement.dataset.theme === 'light' ? 'default' : 'dark',
    securityLevel: 'loose'
  });
</script>
```

Wrap every Mermaid diagram in `.mermaid-wrap` with zoom controls (+/−/reset buttons, Ctrl/Cmd+scroll, click-drag pan).

---

## Quality Checklist

Before writing the file:

- [ ] **Squint test**: step back — does the visual hierarchy guide the eye correctly?
- [ ] **Theme toggle**: works in both dark and light modes
- [ ] **Overflow check**: no content bleeds outside its container at any width
- [ ] **Mobile**: readable at 375px (single column, no horizontal scroll)
- [ ] **Mermaid**: diagrams render and are zoomable
- [ ] **Motion**: animations respect `prefers-reduced-motion`
- [ ] **Facts**: every number and name matches the actual data (no hallucinated values)

---

## Commands

These slash commands invoke specific visual workflows:

- `/web-diagram <topic>` — generate a diagram for any topic
- `/diff-review [branch|commit|PR]` — visual code change analysis
- `/plan-review <path-to-plan>` — validate a plan against the codebase
- `/project-recap [time-window]` — project status snapshot
- `/fact-check [file]` — verify an HTML review page against source code

---

## Anti-patterns

- Never use `display: flex` on `<li>` for markers — use `position: absolute` on `::before`
- Never hardcode colors outside CSS variables
- Never use more than 2 external font families
- Never omit `min-width: 0` on grid children
- Never state a metric you haven't verified from source data
