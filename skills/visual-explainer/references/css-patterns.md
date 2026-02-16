# CSS Patterns Reference

Complete copy-paste patterns for visual-explainer HTML pages.

---

## Core Theme System

```css
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --surface-2: #21262d;
  --border: #30363d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: #58a6ff;
  --accent-dim: rgba(88, 166, 255, 0.15);
  --node-a: #1f6feb;
  --node-b: #388bfd;
  --node-c: #79c0ff;
  --green: #3fb950;
  --green-dim: rgba(63, 185, 80, 0.15);
  --red: #f85149;
  --red-dim: rgba(248, 81, 73, 0.15);
  --amber: #d29922;
  --amber-dim: rgba(210, 153, 34, 0.15);
  --radius: 8px;
}

[data-theme="light"] {
  --bg: #ffffff;
  --surface: #f6f8fa;
  --surface-2: #eaeef2;
  --border: #d0d7de;
  --text: #1f2328;
  --text-muted: #656d76;
  --accent: #0969da;
  --accent-dim: rgba(9, 105, 218, 0.1);
}
```

---

## Background Atmosphere

```css
body {
  background-color: var(--bg);
  /* Option 1: Radial glow */
  background-image: radial-gradient(ellipse at 20% 20%, rgba(88,166,255,0.05) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 80%, rgba(63,185,80,0.05) 0%, transparent 60%);

  /* Option 2: Dot grid */
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;

  /* Option 3: Diagonal lines */
  background-image: repeating-linear-gradient(
    -45deg, transparent, transparent 10px,
    rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px
  );
}
```

---

## Node / Card Variants

```css
.node {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
}

.node--accent-a  { border-left: 3px solid var(--accent); }
.node--elevated  { box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
.node--recessed  { box-shadow: inset 0 1px 4px rgba(0,0,0,0.4); }
.node--hero      { background: var(--accent-dim); border-color: var(--accent); padding: 2rem; }
.node--glass     { backdrop-filter: blur(12px); background: rgba(255,255,255,0.05); }

/* Label with dot indicator */
.node-label {
  font-family: monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
.node-label::before { content: "●"; color: var(--accent); margin-right: 6px; }
```

---

## Overflow Protection

**Rule: every grid/flex child must be able to shrink.**

```css
/* Apply to ALL grid and flex children */
.grid > *, .flex > * { min-width: 0; }

/* Global overflow protection */
*, *::before, *::after { box-sizing: border-box; }
p, li, td, th, code { overflow-wrap: break-word; word-break: break-word; }

/* Lists — NEVER use display:flex on <li> for markers */
.custom-list { list-style: none; padding: 0; }
.custom-list li {
  position: relative;
  padding-left: 1.25rem;
}
.custom-list li::before {
  content: "▸";
  position: absolute;
  left: 0;
  color: var(--accent);
}
```

---

## Mermaid Zoom Controls

```html
<div class="mermaid-wrap" id="diagram-1">
  <div class="mermaid-controls">
    <button onclick="zoom('diagram-1', 0.2)">+</button>
    <button onclick="zoom('diagram-1', -0.2)">−</button>
    <button onclick="resetZoom('diagram-1')">⊙</button>
  </div>
  <div class="mermaid-inner">
    <div class="mermaid">
      graph LR
        A --> B
    </div>
  </div>
</div>

<style>
.mermaid-wrap {
  position: relative;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
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
  width: 28px; height: 28px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.mermaid-inner {
  transform-origin: top left;
  cursor: grab;
  transition: transform 0.1s;
}
.mermaid-inner:active { cursor: grabbing; }
</style>

<script>
const zoomState = {};

function zoom(id, delta) {
  if (!zoomState[id]) zoomState[id] = { scale: 1, x: 0, y: 0 };
  const s = zoomState[id];
  s.scale = Math.max(0.3, Math.min(5, s.scale + delta));
  applyTransform(id);
}

function resetZoom(id) {
  zoomState[id] = { scale: 1, x: 0, y: 0 };
  applyTransform(id);
}

function applyTransform(id) {
  const { scale, x, y } = zoomState[id];
  document.querySelector(`#${id} .mermaid-inner`).style.transform =
    `translate(${x}px, ${y}px) scale(${scale})`;
}

// Ctrl/Cmd+scroll to zoom
document.querySelectorAll('.mermaid-wrap').forEach(wrap => {
  const id = wrap.id;
  wrap.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom(id, e.deltaY < 0 ? 0.1 : -0.1);
  }, { passive: false });

  // Click-drag pan
  let dragging = false, startX, startY;
  const inner = wrap.querySelector('.mermaid-inner');
  inner.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX - (zoomState[id]?.x || 0);
    startY = e.clientY - (zoomState[id]?.y || 0);
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    if (!zoomState[id]) zoomState[id] = { scale: 1, x: 0, y: 0 };
    zoomState[id].x = e.clientX - startX;
    zoomState[id].y = e.clientY - startY;
    applyTransform(id);
  });
  document.addEventListener('mouseup', () => dragging = false);
});
</script>
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

<style>
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
}
.kpi-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}
.kpi-trend { font-size: 0.75rem; margin-top: 0.5rem; }
.kpi-trend--up   { color: var(--green); }
.kpi-trend--down { color: var(--red); }
</style>
```

---

## Before/After Diff Panels

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

<style>
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
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
}
.diff-panel--before .diff-header { color: var(--red); background: var(--red-dim); }
.diff-panel--after  .diff-header { color: var(--green); background: var(--green-dim); }
.diff-panel pre { margin: 0; padding: 1rem; overflow-x: auto; font-size: 0.85rem; }

@media (max-width: 768px) {
  .diff-grid { grid-template-columns: 1fr; }
}
</style>
```

---

## Card Grid (Review/Analysis)

```css
/* Good/Bad/Ugly/Questions pattern */
.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
.review-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 1.25rem;
  border-top: 3px solid;
}
.review-card--good    { border-color: var(--green); }
.review-card--bad     { border-color: var(--red); }
.review-card--ugly    { border-color: var(--amber); }
.review-card--info    { border-color: var(--accent); }
```

---

## Staggered Fade-In Animation

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in {
  opacity: 0;
  animation: fadeUp 0.4s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.06s);
}

@media (prefers-reduced-motion: reduce) {
  .fade-in { animation-duration: 0.01ms; }
}
```

Apply with `style="--i: 0"`, `style="--i: 1"`, etc. on each element.

---

## Collapsible Sections

```html
<details class="collapsible">
  <summary>Reference Material</summary>
  <div class="collapsible-body">
    Content here
  </div>
</details>

<style>
.collapsible { border: 1px solid var(--border); border-radius: var(--radius); }
.collapsible summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.collapsible summary::before {
  content: "▶";
  font-size: 0.6rem;
  transition: transform 0.2s;
  color: var(--text-muted);
}
.collapsible[open] summary::before { transform: rotate(90deg); }
.collapsible-body { padding: 1rem; border-top: 1px solid var(--border); }
</style>
```

---

## Theme Toggle Button

```html
<button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">
  <span class="theme-icon">☀</span>
</button>

<script>
function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.dataset.theme === 'light';
  html.dataset.theme = isLight ? '' : 'light';
  document.querySelector('.theme-icon').textContent = isLight ? '☀' : '☽';
  localStorage.setItem('theme', html.dataset.theme);
}

// Restore saved theme
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;
</script>
```

---

## Responsive Navigation

```html
<nav class="page-nav">
  <a href="#overview">Overview</a>
  <a href="#architecture">Architecture</a>
  <a href="#changes">Changes</a>
  <a href="#review">Review</a>
</nav>

<style>
.page-nav {
  position: sticky;
  top: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 0;
  padding: 0 1rem;
  z-index: 100;
  overflow-x: auto;
  scrollbar-width: none;
}
.page-nav a {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.page-nav a:hover { color: var(--text); border-color: var(--border); }
.page-nav a.active { color: var(--accent); border-color: var(--accent); }
</style>
```

---

## Data Table

```html
<div class="table-wrap">
  <table>
    <thead>
      <tr><th>Name</th><th>Status</th><th class="num">Count</th></tr>
    </thead>
    <tbody>
      <tr><td>Thing A</td><td><span class="badge badge--match">OK</span></td><td class="num">42</td></tr>
    </tbody>
    <tfoot>
      <tr><td colspan="2">Total</td><td class="num">42</td></tr>
    </tfoot>
  </table>
</div>

<style>
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
th {
  position: sticky; top: 0;
  background: var(--surface-2);
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); }
tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
.num { text-align: right; font-variant-numeric: tabular-nums; }
tfoot td { border-top: 2px solid var(--border); border-bottom: none; font-weight: 600; }

.badge { padding: 0.2em 0.5em; border-radius: 4px; font-size: 0.7rem; font-weight: 600; }
.badge--match { background: var(--green-dim); color: var(--green); }
.badge--gap   { background: var(--red-dim);   color: var(--red); }
.badge--warn  { background: var(--amber-dim); color: var(--amber); }
.badge--info  { background: var(--accent-dim); color: var(--accent); }
</style>
```
