# CSS Patterns Reference

Complete copy-paste patterns for visual-explainer HTML pages.

---

## Theme Setup

Both light and dark via custom properties. This is the warm teal/slate example palette — vary it per page.

```css
:root {
  --bg: #0f1a1a;
  --surface: #162020;
  --surface-2: #1e2d2d;
  --border: #2a3f3f;
  --text: #e0e8e4;
  --text-muted: #8a9e94;
  --accent: #5a9e8e;
  --accent-dim: rgba(90, 158, 142, 0.15);
  --accent-2: #c4956a;
  --accent-2-dim: rgba(196, 149, 106, 0.15);
  --green: #5ab878;
  --green-dim: rgba(90, 184, 120, 0.15);
  --red: #d45d5d;
  --red-dim: rgba(212, 93, 93, 0.15);
  --amber: #c4a03a;
  --amber-dim: rgba(196, 160, 58, 0.15);
  --radius: 8px;
  --font-heading: 'IBM Plex Sans', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

[data-theme="light"] {
  --bg: #f5f2ed;
  --surface: #ffffff;
  --surface-2: #eae6df;
  --border: #d4cec4;
  --text: #2d3530;
  --text-muted: #6b7a70;
  --accent: #3d7a6a;
  --accent-dim: rgba(61, 122, 106, 0.1);
  --accent-2: #a06030;
  --accent-2-dim: rgba(160, 96, 48, 0.1);
  --green: #2d8a4a;
  --green-dim: rgba(45, 138, 74, 0.1);
  --red: #b83a3a;
  --red-dim: rgba(184, 58, 58, 0.1);
  --amber: #9a7a20;
  --amber-dim: rgba(154, 122, 32, 0.1);
}

*, *::before, *::after { box-sizing: border-box; }
```

---

## Background Atmosphere

```css
body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
  margin: 0;
}

/* Option 1: Radial glow */
body.bg-glow {
  background-image:
    radial-gradient(ellipse at 20% 20%, rgba(90,158,142,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(196,149,106,0.04) 0%, transparent 60%);
}

/* Option 2: Dot grid */
body.bg-dots {
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Option 3: Diagonal lines */
body.bg-lines {
  background-image: repeating-linear-gradient(
    -45deg, transparent, transparent 10px,
    rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.015) 11px
  );
}

/* Option 4: Gradient mesh */
body.bg-mesh {
  background-image:
    radial-gradient(at 0% 0%, rgba(90,158,142,0.08) 0%, transparent 50%),
    radial-gradient(at 100% 50%, rgba(196,149,106,0.06) 0%, transparent 50%),
    radial-gradient(at 50% 100%, rgba(90,158,142,0.04) 0%, transparent 50%);
}
```

---

## Link Styling

Never rely on browser default link colors.

```css
a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: var(--accent-dim);
  text-underline-offset: 2px;
  transition: color 0.15s, text-decoration-color 0.15s;
}
a:hover {
  color: var(--text);
  text-decoration-color: var(--accent);
}
```

---

## Section / Card Components

Use `.ve-card` — NOT `.node` which conflicts with Mermaid SVG classes.

```css
.ve-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  min-width: 0;
}

/* Depth tiers */
.ve-card--elevated  { box-shadow: 0 4px 24px rgba(0,0,0,0.25); }
.ve-card--recessed  { box-shadow: inset 0 1px 4px rgba(0,0,0,0.3); }
.ve-card--hero      { background: var(--accent-dim); border-color: var(--accent); padding: 2rem; }
.ve-card--glass     { backdrop-filter: blur(12px); background: rgba(255,255,255,0.05); }

[data-theme="light"] .ve-card--elevated { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
[data-theme="light"] .ve-card--recessed { box-shadow: inset 0 1px 4px rgba(0,0,0,0.08); }
[data-theme="light"] .ve-card--glass    { background: rgba(255,255,255,0.7); }

/* Section label with colored dot */
.ve-label {
  font-family: var(--font-mono);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.ve-label::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-right: 6px;
  vertical-align: middle;
}
```

---

## Code Blocks

```css
pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  font-family: var(--font-mono);
  font-size: 0.85em;
}

/* Inline code */
p code, li code, td code {
  background: var(--surface-2);
  padding: 0.15em 0.35em;
  border-radius: 3px;
  font-size: 0.85em;
}
```

### Code Block with File Header

```html
<div class="code-file">
  <div class="code-file-header">src/index.ts</div>
  <pre><code>const app = express();</code></pre>
</div>
```

```css
.code-file {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.code-file-header {
  padding: 0.4rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--text-muted);
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.code-file pre {
  margin: 0;
  border: none;
  border-radius: 0;
}
```

### Implementation Plans: Code Display

For implementation plans, don't dump full files. Show structure with descriptions and key snippets. Use collapsible sections for full code when needed.

---

## Directory Tree

```css
.dir-tree {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.8;
  color: var(--text-muted);
  white-space: pre;
}
.dir-tree .dir  { color: var(--accent); }
.dir-tree .file { color: var(--text); }
.dir-tree .new  { color: var(--green); }
.dir-tree .mod  { color: var(--amber); }
.dir-tree .del  { color: var(--red); }
```

### Side-by-Side Directory Comparison

```css
.dir-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.dir-compare > * { min-width: 0; background: var(--surface); padding: 1rem; }

@media (max-width: 768px) {
  .dir-compare { grid-template-columns: 1fr; }
}
```

---

## Overflow Protection

### Global Rules

```css
*, *::before, *::after { box-sizing: border-box; }
p, li, td, th, code, span { overflow-wrap: break-word; word-break: break-word; }
img, svg, video, canvas { max-width: 100%; height: auto; }
```

### Side-by-Side Panels

```css
.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.side-by-side > * { min-width: 0; }

@media (max-width: 768px) {
  .side-by-side { grid-template-columns: 1fr; }
}
```

### Never flex on li

```css
/* WRONG — breaks list markers */
/* li { display: flex; } */

/* RIGHT — use position for custom markers */
.custom-list { list-style: none; padding: 0; }
.custom-list li {
  position: relative;
  padding-left: 1.25rem;
}
.custom-list li::before {
  content: ">";
  position: absolute;
  left: 0;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.85em;
}
```

### List Markers Overlapping Borders

If list items have borders or backgrounds, ensure markers don't overlap:

```css
.bordered-list li {
  padding-left: 1.5rem;
  margin-left: 0;
}
.bordered-list li::before {
  position: absolute;
  left: 0.5rem;
}
```

---

## Mermaid Containers

Center, scale, and provide zoom controls for every Mermaid diagram.

```html
<div class="mermaid-wrap" id="diagram-1">
  <div class="mermaid-controls">
    <button data-action="zoom-in">+</button>
    <button data-action="zoom-out">&minus;</button>
    <button data-action="reset">&oplus;</button>
  </div>
  <div class="mermaid-inner">
    <div class="mermaid">
      graph TD
        A --> B
    </div>
  </div>
</div>
```

```css
.mermaid-wrap {
  position: relative;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin: 1rem 0;
}

.mermaid-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  z-index: 10;
}

.mermaid-controls button {
  width: 28px;
  height: 28px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mermaid-controls button:hover {
  background: var(--border);
}

.mermaid-inner {
  transform-origin: center center;
  cursor: grab;
  transition: transform 0.1s ease;
  display: flex;
  justify-content: center;
}
.mermaid-inner:active { cursor: grabbing; }

.mermaid-inner svg {
  max-width: 100%;
  height: auto;
}
```

### Zoom Controls JavaScript (Closure-Based Init)

```javascript
(function initMermaidZoom() {
  document.querySelectorAll('.mermaid-wrap').forEach(wrap => {
    const id = wrap.id;
    const inner = wrap.querySelector('.mermaid-inner');
    let scale = 1, x = 0, y = 0;
    let dragging = false, startX, startY;

    function apply() {
      inner.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    // Button controls
    wrap.querySelector('[data-action="zoom-in"]').addEventListener('click', () => {
      scale = Math.min(5, scale + 0.2);
      apply();
    });
    wrap.querySelector('[data-action="zoom-out"]').addEventListener('click', () => {
      scale = Math.max(0.3, scale - 0.2);
      apply();
    });
    wrap.querySelector('[data-action="reset"]').addEventListener('click', () => {
      scale = 1; x = 0; y = 0;
      apply();
    });

    // Ctrl/Cmd + scroll to zoom
    wrap.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      scale = Math.max(0.3, Math.min(5, scale + (e.deltaY < 0 ? 0.1 : -0.1)));
      apply();
    }, { passive: false });

    // Click-drag to pan
    inner.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX - x;
      startY = e.clientY - y;
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      x = e.clientX - startX;
      y = e.clientY - startY;
      apply();
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  });
})();
```

---

## Grid Layouts

### Architecture 2-Column

```css
.arch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.arch-grid > * { min-width: 0; }
.arch-full { grid-column: 1 / -1; }

@media (max-width: 768px) {
  .arch-grid { grid-template-columns: 1fr; }
}
```

### Pipeline Horizontal

```css
.pipeline {
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.pipeline-stage {
  flex: 1;
  min-width: 120px;
  position: relative;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
}
.pipeline-stage:not(:last-child)::after {
  content: "";
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid var(--accent);
  z-index: 1;
}
```

### Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
.card-grid > * { min-width: 0; }
```

---

## Data Tables

### Full Table Pattern

```html
<div class="table-wrap">
  <div class="table-scroll">
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th class="num">Count</th>
          <th class="num">Size</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Component A</td>
          <td><span class="status status--ok">Active</span></td>
          <td class="num">42</td>
          <td class="num">1.2 KB</td>
        </tr>
        <tr>
          <td>Component B</td>
          <td><span class="status status--warn">Degraded</span></td>
          <td class="num">17</td>
          <td class="num">3.8 KB</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">Total</td>
          <td class="num">59</td>
          <td class="num">5.0 KB</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
```

```css
.table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

/* Sticky header */
.data-table thead th {
  position: sticky;
  top: 0;
  background: var(--surface-2);
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border);
  white-space: nowrap;
  z-index: 2;
}

/* Cells */
.data-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

/* Alternating rows */
.data-table tbody tr:nth-child(even) td {
  background: rgba(255,255,255,0.02);
}
[data-theme="light"] .data-table tbody tr:nth-child(even) td {
  background: rgba(0,0,0,0.02);
}

/* Hover */
.data-table tbody tr:hover td {
  background: var(--accent-dim);
}

/* Numeric columns */
.data-table .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

/* Status indicators — styled spans, never emoji */
.status {
  display: inline-block;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.status--ok     { background: var(--green-dim); color: var(--green); }
.status--warn   { background: var(--amber-dim); color: var(--amber); }
.status--error  { background: var(--red-dim);   color: var(--red); }
.status--info   { background: var(--accent-dim); color: var(--accent); }

/* Summary footer */
.data-table tfoot td {
  border-top: 2px solid var(--border);
  border-bottom: none;
  font-weight: 600;
  background: var(--surface-2);
  font-size: 0.8rem;
}

/* Sticky first column (for wide tables) */
.data-table.sticky-col th:first-child,
.data-table.sticky-col td:first-child {
  position: sticky;
  left: 0;
  background: var(--surface);
  z-index: 1;
  border-right: 2px solid var(--border);
}
.data-table.sticky-col thead th:first-child {
  background: var(--surface-2);
  z-index: 3;
}
```

---

## Connectors

### CSS Vertical Arrows

```css
.connector-down {
  width: 2px;
  height: 2rem;
  background: var(--border);
  margin: 0 auto;
  position: relative;
}
.connector-down::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--accent);
}
```

### Horizontal Arrows

```css
.connector-right {
  height: 2px;
  width: 2rem;
  background: var(--border);
  position: relative;
  align-self: center;
}
.connector-right::after {
  content: "";
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid var(--accent);
}
```

### SVG Curved Connectors

For complex connections between CSS elements, use inline SVG with absolute positioning:

```html
<svg class="connector-svg" viewBox="0 0 200 100" preserveAspectRatio="none">
  <path d="M 0,50 C 50,50 150,10 200,50" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4,4" />
</svg>
```

```css
.connector-svg {
  position: absolute;
  width: 100%;
  height: 100px;
  pointer-events: none;
  z-index: 0;
}
```

---

## Animations

### fadeUp Stagger

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in {
  opacity: 0;
  animation: fadeUp 0.4s ease-out forwards;
  animation-delay: calc(var(--i, 0) * 0.06s);
}
```

Apply with `style="--i: 0"`, `style="--i: 1"`, etc.

### Hover Lift

```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}
```

### fadeScale

```css
@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
```

### SVG drawIn

```css
@keyframes drawIn {
  from { stroke-dashoffset: 1000; }
  to   { stroke-dashoffset: 0; }
}

.draw-in {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawIn 1.5s ease-out forwards;
  animation-delay: calc(var(--i, 0) * 0.1s);
}
```

### CSS Counter

```css
.numbered-list { counter-reset: items; }
.numbered-list > * { counter-increment: items; }
.numbered-list > *::before {
  content: counter(items, decimal-leading-zero);
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--accent);
  margin-right: 0.5rem;
}
```

### Choreography Notes

- Stagger delay: 0.04s-0.08s per element. Faster = more energetic, slower = more deliberate.
- Total animation budget: keep under 2 seconds for all elements to finish appearing.
- Direction: animate elements in reading order (top-to-bottom, left-to-right).
- Don't animate everything — pick the 1-2 most impactful moments.

### Reduced Motion

Always include:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Sparklines and Simple Charts

Pure SVG, no library needed:

```html
<svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
  <polyline
    points="0,25 15,20 30,22 45,10 60,15 75,5 90,12 100,8"
    fill="none"
    stroke="var(--accent)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <polyline
    points="0,25 15,20 30,22 45,10 60,15 75,5 90,12 100,8 100,30 0,30"
    fill="var(--accent-dim)"
    stroke="none"
  />
</svg>
```

```css
.sparkline {
  width: 80px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
}
```

---

## Responsive Breakpoint

Single breakpoint at 768px. Keep it simple.

```css
@media (max-width: 768px) {
  .arch-grid,
  .side-by-side,
  .diff-grid,
  .dir-compare {
    grid-template-columns: 1fr;
  }

  .pipeline {
    flex-direction: column;
  }
  .pipeline-stage:not(:last-child)::after {
    right: 50%;
    bottom: -10px;
    top: auto;
    transform: translateX(50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid var(--accent);
    border-bottom: none;
  }
}
```

---

## Badges and Tags

```css
.badge {
  display: inline-block;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.badge--ok    { background: var(--green-dim); color: var(--green); }
.badge--warn  { background: var(--amber-dim); color: var(--amber); }
.badge--error { background: var(--red-dim);   color: var(--red); }
.badge--info  { background: var(--accent-dim); color: var(--accent); }
.badge--neutral {
  background: var(--surface-2);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.tag {
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 500;
  background: var(--surface-2);
  color: var(--text-muted);
  border: 1px solid var(--border);
}
```

---

## Lists Inside Nodes

When cards/nodes contain lists:

```css
.ve-card ul, .ve-card ol {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}
.ve-card li {
  padding: 0.15rem 0;
  font-size: 1rem;
}
.ve-card li + li {
  border-top: 1px solid var(--border);
}
```

---

## KPI / Metric Cards

```html
<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-number">42</div>
    <div class="kpi-label">Files Changed</div>
    <div class="kpi-trend kpi-trend--up">+12 from last week</div>
  </div>
</div>
```

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}
.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  text-align: center;
}
.kpi-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  font-family: var(--font-heading);
}
.kpi-label {
  font-size: 1rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}
.kpi-trend { font-size: 1rem; margin-top: 0.5rem; }
.kpi-trend--up   { color: var(--green); }
.kpi-trend--down { color: var(--red); }
.kpi-trend--flat { color: var(--text-muted); }
```

---

## Before / After Panels

```html
<div class="diff-grid">
  <div class="diff-panel diff-panel--before">
    <div class="diff-header">Before</div>
    <pre><code>// old code here</code></pre>
  </div>
  <div class="diff-panel diff-panel--after">
    <div class="diff-header">After</div>
    <pre><code>// new code here</code></pre>
  </div>
</div>
```

```css
.diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.diff-grid > * { min-width: 0; }
.diff-panel { background: var(--surface); }
.diff-panel--before { border-left: 3px solid var(--red); }
.diff-panel--after  { border-left: 3px solid var(--green); }
.diff-header {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
}
.diff-panel--before .diff-header { color: var(--red); background: var(--red-dim); }
.diff-panel--after  .diff-header { color: var(--green); background: var(--green-dim); }
.diff-panel pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  font-size: 1rem;
  border: none;
  border-radius: 0;
}

@media (max-width: 768px) {
  .diff-grid { grid-template-columns: 1fr; }
}
```

---

## Collapsible Sections

```html
<details class="collapsible">
  <summary>Reference Material</summary>
  <div class="collapsible-body">
    Content here
  </div>
</details>
```

```css
.collapsible {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 0.5rem 0;
}
.collapsible summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}
.collapsible summary::-webkit-details-marker { display: none; }
.collapsible summary::before {
  content: ">";
  font-family: var(--font-mono);
  font-size: 1rem;
  transition: transform 0.2s;
  color: var(--text-muted);
  flex-shrink: 0;
}
.collapsible[open] summary::before { transform: rotate(90deg); }
.collapsible-body {
  padding: 1rem;
  border-top: 1px solid var(--border);
}
```

---

## Prose Page Elements

### Body Text Settings

```css
.prose {
  max-width: 65ch;
  margin: 0 auto;
  line-height: 1.75;
  font-size: 1.05rem;
}
.prose p { margin: 1.25em 0; }
.prose h2 {
  margin-top: 2.5em;
  margin-bottom: 0.75em;
  font-family: var(--font-heading);
}
.prose h3 {
  margin-top: 2em;
  margin-bottom: 0.5em;
  font-family: var(--font-heading);
}
```

### Lead Paragraph

```css
.lead {
  font-size: 1.2em;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 55ch;
  margin-bottom: 2rem;
}
```

### Pull Quotes

```css
.pull-quote {
  border-left: 3px solid var(--accent);
  padding: 0.75rem 1.25rem;
  margin: 2rem 0;
  font-size: 1.15em;
  font-style: italic;
  color: var(--text-muted);
}
.pull-quote cite {
  display: block;
  font-size: 0.8rem;
  font-style: normal;
  color: var(--accent);
  margin-top: 0.5rem;
}
```

### Section Dividers

```css
.divider {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 3rem 0;
}
.divider--accent {
  height: 2px;
  background: linear-gradient(to right, var(--accent), transparent);
  max-width: 120px;
}
```

### Article Hero Patterns

```css
.article-hero {
  padding: 3rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}
.article-hero h1 {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  line-height: 1.15;
  margin: 0 0 0.75rem;
}
.article-hero .subtitle {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 55ch;
}
```

### Author Byline

```css
.byline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  color: var(--text-muted);
  margin-top: 1rem;
}
.byline-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--accent);
  font-size: 0.8rem;
}
```

### Callout Boxes

```css
.callout {
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  border-left: 3px solid;
}
.callout--info {
  background: var(--accent-dim);
  border-color: var(--accent);
}
.callout--warn {
  background: var(--amber-dim);
  border-color: var(--amber);
}
.callout--danger {
  background: var(--red-dim);
  border-color: var(--red);
}
.callout--tip {
  background: var(--green-dim);
  border-color: var(--green);
}
.callout-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
```

### Theme Toggle

```html
<button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">
  <i class="ri-moon-line theme-icon"></i>
</button>
```

```css
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: background 0.15s, border-color 0.15s;
}
.theme-toggle:hover {
  background: var(--surface-2);
}
```

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.dataset.theme === 'light';
  html.dataset.theme = isLight ? '' : 'light';
  const icon = document.querySelector('.theme-icon');
  icon.className = isLight ? 'ri-moon-line theme-icon' : 'ri-sun-line theme-icon';
  localStorage.setItem('ve-theme', html.dataset.theme);
}

// Restore saved theme
(function() {
  const saved = localStorage.getItem('ve-theme');
  if (saved !== null) {
    document.documentElement.dataset.theme = saved;
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.className = saved === 'light' ? 'ri-sun-line theme-icon' : 'ri-moon-line theme-icon';
  }
})();
```

### Prose Anti-Patterns

- Don't set `text-align: justify` — it creates rivers of whitespace
- Don't use `font-size` below 0.95rem for body text
- Don't exceed 75ch line length — 65ch is the sweet spot
- Don't apply letter-spacing to body text — reserve for labels and headings
- Don't use light grey text (< 4.5:1 contrast ratio) for body copy

---

## Generated Images

Use CSS gradients and shapes for decorative images — no external image dependencies.

### Hero Banner

```css
.hero-banner {
  height: 200px;
  background:
    linear-gradient(135deg, var(--accent-dim) 0%, transparent 60%),
    linear-gradient(225deg, var(--accent-2-dim) 0%, transparent 60%),
    var(--surface);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Inline Illustration

```css
.illustration {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: var(--accent-dim);
  border: 1px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}
```

### Side Accent

```css
.side-accent {
  position: absolute;
  right: -20px;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--accent), transparent);
  border-radius: 2px;
}
```

---

## Responsive Section Navigation

Full layout structure with desktop sidebar TOC and mobile horizontal bar.

### Layout Structure

```html
<div class="page-layout">
  <nav class="section-nav" id="section-nav">
    <div class="nav-title">Contents</div>
    <a href="#overview" class="nav-link active">Overview</a>
    <a href="#architecture" class="nav-link">Architecture</a>
    <a href="#details" class="nav-link">Details</a>
    <a href="#summary" class="nav-link">Summary</a>
  </nav>
  <main class="page-content">
    <section id="overview">...</section>
    <section id="architecture">...</section>
    <section id="details">...</section>
    <section id="summary">...</section>
  </main>
</div>
```

### CSS: Desktop Sidebar TOC + Mobile Horizontal Bar

```css
.page-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.section-nav {
  position: sticky;
  top: 2rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.nav-title {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-family: var(--font-mono);
}

.nav-link {
  font-size: 1rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 0.35rem 0.75rem;
  border-left: 2px solid transparent;
  border-radius: 0 4px 4px 0;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.nav-link:hover {
  color: var(--text);
  background: var(--surface);
}
.nav-link.active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: var(--accent-dim);
}

.page-content {
  min-width: 0;
}

/* Mobile: horizontal scrolling bar */
@media (max-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 0;
  }

  .section-nav {
    position: sticky;
    top: 0;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: visible;
    scrollbar-width: none;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    padding: 0.5rem 0;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    z-index: 100;
    gap: 0;
    max-height: none;
  }
  .section-nav::-webkit-scrollbar { display: none; }

  .nav-title { display: none; }

  .nav-link {
    border-left: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    white-space: nowrap;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  .nav-link.active {
    border-bottom-color: var(--accent);
    border-left-color: transparent;
  }
}
```

### JavaScript: Scroll Spy

```javascript
(function initScrollSpy() {
  const sections = document.querySelectorAll('.page-content section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
})();
```
