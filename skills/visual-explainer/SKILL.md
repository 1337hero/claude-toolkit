---
name: visual-explainer
description: Generate self-contained HTML files for technical diagrams, visualizations, and data tables. Always open the result in the browser. Never fall back to ASCII art when this skill is loaded.
---

# Visual Explainer

Generate self-contained HTML files for technical diagrams, visualizations, and data tables. Always open the result in the browser. Never fall back to ASCII art when this skill is loaded.

## Proactive Table Rendering

When about to present tabular data as an ASCII box-drawing table in the terminal (comparisons, audits, feature matrices, status reports, any structured rows/columns), generate an HTML page instead.

**Threshold:** if the table has 4+ rows or 3+ columns, it belongs in the browser.

Don't wait for the user to ask — render it as HTML automatically and tell them the file path. You can still include a brief text summary in the chat, but the table itself should be the HTML page.

---

## Workflow

### 1. Think (5 seconds, not 5 minutes)

Before writing HTML, commit to a direction. Don't default to "dark theme with blue accents" every time. Visual is always default. Even essays, blog posts, and articles get visual treatment — extract structure into cards, diagrams, grids, tables. Prose patterns (lead paragraphs, pull quotes, callout boxes) are accent elements within visual pages, not a separate mode.

**Who is looking?** A developer understanding a system? A PM seeing the big picture? A team reviewing a proposal? This shapes information density and visual complexity.

**What type of content?** Architecture, flowchart, sequence, data flow, schema/ER, state machine, mind map, class diagram, C4 architecture, data table, timeline, dashboard, or prose-first page. Each has distinct layout needs and rendering approaches (see Diagram Types section and references).

### 2. Select diagram type

See the Diagram Types section below for the full type matrix.

### 3. Style with intention

Reference font pairings from `references/libraries.md`. Pick a non-default palette. Don't reach for the same teal-and-slate every time — the references include multiple palettes and the anti-patterns section lists what to avoid.

### 4. Structure the HTML

Self-contained. Both themes. Responsive.

Required elements:
- **Minimum font size: 16px (1rem).** No text element should render smaller than 16px. Labels, captions, badges, trends, metadata — all 16px floor. If something feels like it needs to be smaller, reduce its visual weight with color/opacity instead.
- `<!DOCTYPE html>` with `lang="en"`
- Remix Icon CDN: `<link href="https://cdn.jsdelivr.net/npm/remixicon@4/fonts/remixicon.css" rel="stylesheet">` — use `ri-*` classes for all icons (theme toggle, callouts, status indicators, etc.). See `references/libraries.md` for usage.
- CSS variables for theming in `:root` and `[data-theme="light"]`
- Sticky or fixed navigation for sections longer than one screen
- Responsive single breakpoint at `768px`
- `min-width: 0` on ALL grid/flex children (overflow protection)
- Theme toggle button
- Links must be explicitly styled (never rely on browser defaults)

### 5. Deliver

Write the file to `~/.agent/diagrams/<descriptive-name>.html` then open it:

```bash
mkdir -p ~/.agent/diagrams
# write file, then:
xdg-open ~/.agent/diagrams/<name>.html
```

---

## Diagram Types

### Architecture / System Diagrams

Three approaches based on complexity:

| Complexity | Approach |
|---|---|
| Simple (< 8 nodes) | Mermaid flowchart |
| Text-heavy (long labels, descriptions) | CSS Grid with cards and CSS arrow connectors |
| Complex (mixed nodes + heavy text) | Hybrid — Mermaid for flow, CSS cards for detail panels |

### Flowcharts / Pipelines

Mermaid flowchart. Prefer `graph TD` (top-down) for vertical flows, `graph LR` for horizontal pipelines. See `references/libraries.md` for direction guidance.

### Sequence Diagrams

Mermaid `sequenceDiagram`. Keep participant names short. Use plain text only in messages (no special characters).

### Data Flow Diagrams

Mermaid with edge labels: `A -->|transforms| B`. Use subgraphs to group related components.

### Schema / ER Diagrams

Mermaid `erDiagram`. Show relationships with cardinality notation.

### State Machines / Decision Trees

Mermaid `stateDiagram-v2`. **Caveat:** state labels don't support special characters well. If you need special characters in labels, fall back to `flowchart TD` with styled nodes instead.

### Mind Maps

Mermaid `mindmap`. Good for brainstorming, feature exploration, taxonomy.

### Class Diagrams

Mermaid `classDiagram`. Show methods, properties, inheritance, composition.

### C4 Architecture

Use Mermaid `flowchart` syntax with styled subgraphs. Do **NOT** use native `C4Context` — it has poor rendering support.

### Data Tables

Real `<table>` element. This is the proactive rendering target.

- Sticky header
- Alternating row backgrounds
- Hover highlight
- Status indicators: styled `<span>` badges, **never emoji**
- Numeric columns right-aligned with `font-variant-numeric: tabular-nums`
- Summary footer row
- Sticky first column for wide tables
- See `references/css-patterns.md` for full table patterns

### Timeline / Roadmap

CSS pseudo-element central line with alternating cards left/right. Each card gets a date marker, title, and description. Collapses to single column on mobile.

### Dashboard / Metrics

Card grid layout. Hero numbers in large font. Sparklines via inline SVG. For real charts with axes and legends, use Chart.js (see `references/libraries.md`).

### Implementation Plans

Don't dump full files — show structure with descriptions. Pattern:

- Overview hero section (what problem does this solve?)
- File structure with one-line descriptions per function/export
- Key implementation snippets (core logic only)
- Phase breakdown as numbered cards or timeline
- Risk callout boxes for gotchas
- Collapsible sections for full code when needed

### Documentation

Transform prose into visual elements:

| Content | Visual Treatment |
|---|---|
| Feature list | Card grid |
| Steps/process | Numbered flow |
| API reference | Table |
| Configuration | Table |
| Architecture | Diagram |
| Comparisons | Side-by-side panels |
| Warnings/caveats | Callout boxes |

### Prose Accent Elements

Use sparingly within visual pages, not as a separate mode:

- **Lead paragraph** — larger font, muted color, max-width for readability
- **Pull quote** — offset with left border, larger italic text
- **Callout box** — colored left border, background tint, icon
- **Section divider** — subtle line or spacing break

---

## Commands

These slash commands invoke specific visual workflows:

- `/web-diagram <topic>` — generate a diagram for any topic
- `/generate-visual-plan <feature>` — generate a visual implementation plan
- `/diff-review [branch|commit|PR]` — visual code change analysis
- `/plan-review <path-to-plan>` — validate a plan against the codebase
- `/project-recap [time-window]` — project status snapshot
- `/fact-check [file]` — verify an HTML review page against source code

---

## Quality Checks

Before delivering:

- **Squint test:** Blur your eyes. Can you still perceive hierarchy? If everything looks the same weight, the visual hierarchy is broken.
- **Swap test:** Would replacing fonts and colors with a generic dark theme make this indistinguishable from a template? Push further.
- **Both themes:** Toggle OS between light and dark. Both should look intentional, not like one is an afterthought.
- **Information completeness:** Does the diagram actually convey what the user asked for? Every metric verified from source data.
- **No overflow:** Resize to different widths. No content should clip or cause horizontal scroll.
- **Mermaid zoom controls:** Every `.mermaid-wrap` must have zoom controls (+/-/reset buttons), Ctrl/Cmd+scroll zoom, click-drag pan, click-to-expand.
- **File opens cleanly:** No console errors. All CDN resources load.

---

## Anti-Patterns (AI Slop)

### Typography

**Forbidden fonts:** Inter, Roboto, Arial, Helvetica, `system-ui` alone. These are the default choices that make every AI-generated page look identical. Pick real fonts from the pairings in `references/libraries.md`.

### Color

**Forbidden accents:** indigo-500 / violet-500 (`#8b5cf6`, `#7c3aed`, `#a78bfa`), cyan+magenta+pink neon combos.

**Forbidden effects:** gradient text on headings, animated glowing shadows, overlapping radial neon haze backgrounds.

### Section Headers

No emoji icons before section titles. No identical "icon in rounded colored box" pattern repeated for every section. Vary visual treatment.

### Layout

- No "perfectly centered everything" — offset, asymmetry, and whitespace create visual interest
- No identical cards with identical visual weight — vary card sizes, use hero cards
- No equal visual treatment for everything — establish hierarchy through size, color, and position
- No perfectly symmetric layouts — intentional asymmetry reads as designed, not generated

### Template Patterns

- No three-dot window chrome (the fake macOS traffic lights on code blocks)
- No identical gradient KPI cards in a row
- No "Neon Dashboard" aesthetic (dark background + glowing cyan/magenta/pink)
- No pink/purple/cyan gradient mesh backgrounds

### The Slop Test

If 2+ of these telltale signs are present, regenerate with a different aesthetic direction:
1. Inter or Roboto font
2. Violet/indigo primary accent
3. Gradient text on headings
4. Three-dot window chrome
5. Identical card grid with no hierarchy
6. Cyan + magenta neon glow
7. Emoji section headers

---

## References

```
See references/css-patterns.md for CSS component patterns
See references/libraries.md for CDN libraries, font pairings, Mermaid configuration
See references/templates/ for reference HTML templates
```
