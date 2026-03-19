# External Libraries Reference

CDN libraries, font pairings, and configuration for visual-explainer HTML pages.

---

## Mermaid.js

### CDN Import (ESM Module)

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
      // Set based on current theme — see Deep Theming below
    }
  });
</script>
```

### ELK Layout (for complex graphs)

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0.1/dist/mermaid-layout-elk.esm.min.mjs';

  mermaid.registerLayoutLoaders(elkLayouts);
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    layout: 'elk',
    securityLevel: 'loose'
  });
</script>
```

### Deep Theming

Always use `theme: 'base'` — never `'dark'` or `'default'`. The `base` theme respects your `themeVariables` fully.

```javascript
const isDark = document.documentElement.dataset.theme !== 'light';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: isDark ? {
    primaryColor: '#1a3a4a',
    primaryTextColor: '#e0e0e0',
    primaryBorderColor: '#2d6a6a',
    secondaryColor: '#2a2a35',
    secondaryTextColor: '#c0c0c0',
    secondaryBorderColor: '#404050',
    tertiaryColor: '#1e2d1e',
    lineColor: '#5a8a8a',
    textColor: '#d0d0d0',
    mainBkg: '#1a3a4a',
    nodeBorder: '#2d6a6a',
    clusterBkg: '#15252f',
    clusterBorder: '#2d6a6a',
    edgeLabelBackground: '#1a2530',
    fontSize: '14px'
  } : {
    primaryColor: '#e8f0ed',
    primaryTextColor: '#2d3b35',
    primaryBorderColor: '#7a9e8e',
    secondaryColor: '#f5f0eb',
    secondaryTextColor: '#4a4040',
    secondaryBorderColor: '#c0b0a0',
    tertiaryColor: '#f0f5f0',
    lineColor: '#7a9e8e',
    textColor: '#2d3b35',
    mainBkg: '#e8f0ed',
    nodeBorder: '#7a9e8e',
    clusterBkg: '#f5f8f6',
    clusterBorder: '#7a9e8e',
    edgeLabelBackground: '#ffffff',
    fontSize: '14px'
  }
});
```

**FORBIDDEN themeVariables colors** — these are AI-slop violet/indigo defaults:
- `#8b5cf6`
- `#7c3aed`
- `#a78bfa`
- `#d946ef`

Use teal, sage, terracotta, slate, warm grey, or other intentional palettes instead.

### CSS Overrides on Mermaid SVG

After Mermaid renders, you can override SVG styles:

```css
/* Node labels */
.mermaid .nodeLabel { font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; }

/* Edge labels */
.mermaid .edgeLabel { font-family: 'IBM Plex Mono', monospace; font-size: 11px; }

/* Node shapes */
.mermaid .node rect,
.mermaid .node circle,
.mermaid .node polygon { stroke-width: 1.5px; }

/* Edge paths */
.mermaid .edgePath .path { stroke-width: 1.5px; }
```

### classDef and style Gotchas

- **Never set `color:` in classDef** — it doesn't reliably change text color. Use CSS overrides on `.nodeLabel` instead.
- **Use semi-transparent 8-digit hex for fills:** `classDef highlight fill:#2d6a6a80,stroke:#2d6a6a` (the `80` suffix = 50% opacity)
- **style statements** apply to individual nodes: `style nodeId fill:#1a3a4a,stroke:#2d6a6a`

### Node Label Special Characters

Quoting rules for node text:

```
A[Simple text]           -- plain text, no quotes needed
B["Text with (parens)"]  -- special chars need double quotes
C["Text with #quot;"]    -- escaped quote inside label
D["Line 1<br>Line 2"]   -- line break in label
```

### stateDiagram-v2 Label Limitations

State labels don't support special characters, HTML, or line breaks well. If you need rich labels in a state diagram, use `flowchart TD` instead and style nodes to look like states:

```
flowchart TD
  A["State: Idle<br><small>Waiting for input</small>"]
  B["State: Processing<br><small>Validating data</small>"]
  A -->|"event: submit"| B
```

### Writing Valid Mermaid

- **Multi-line labels:** use `<br>` not actual newlines
- **Quote special chars:** `["text with (parens) and #amp; symbols"]`
- **Simple IDs:** use `A`, `B`, `C` or `node1`, `node2` — avoid spaces or special chars in IDs
- **Max 10-12 nodes** per diagram for readability. Split larger systems into subgraphs or multiple diagrams.
- **Subgraph grouping:** `subgraph Title` ... `end` — nest for visual organization
- **Arrow styles:**

| Syntax | Meaning |
|---|---|
| `-->` | Solid arrow |
| `-.->` | Dotted arrow |
| `==>` | Thick arrow |
| `-->\|label\|` | Arrow with label |
| `--- ` | Solid line (no arrow) |

- **Escape pipes** in labels: use `#124;` for literal pipe character
- **Sequence diagrams:** plain text only in messages, no special chars or HTML

### Layout Direction: TD vs LR

| Direction | When to use |
|---|---|
| `TD` (top-down) | Hierarchies, decision trees, pipelines with stages, anything that reads like a flowchart |
| `LR` (left-right) | Timelines, data pipelines, request/response flows, anything that reads like a sequence |
| `RL` | Rare — reverse dependency chains |
| `BT` | Rare — bottom-up reporting structures |

### Diagram Type Examples

**Flowchart:**
```
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action A]
  B -->|No| D[Action B]
  C --> E[End]
  D --> E
```

**Sequence:**
```
sequenceDiagram
  participant C as Client
  participant S as Server
  participant D as Database
  C->>S: POST /api/data
  S->>D: INSERT query
  D-->>S: OK
  S-->>C: 201 Created
```

**ER Diagram:**
```
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "appears in"
```

**State Diagram:**
```
stateDiagram-v2
  [*] --> Idle
  Idle --> Processing : submit
  Processing --> Success : valid
  Processing --> Error : invalid
  Error --> Idle : retry
  Success --> [*]
```

**Mind Map:**
```
mindmap
  root((Project))
    Frontend
      React
      Components
      State
    Backend
      API
      Database
      Auth
    Infra
      CI/CD
      Hosting
      Monitoring
```

**Class Diagram:**
```
classDiagram
  class Animal {
    +String name
    +int age
    +makeSound() void
  }
  class Dog {
    +fetch() void
  }
  Animal <|-- Dog
```

**C4 Architecture (using flowchart):**
```
graph TD
  subgraph boundary["System Boundary"]
    direction TB
    webapp["Web App<br><small>React SPA</small>"]
    api["API Server<br><small>Node.js + Express</small>"]
    db[("Database<br><small>PostgreSQL</small>")]
    webapp --> api
    api --> db
  end
  user["User<br><small>Customer</small>"] --> webapp
  api --> ext["External Service<br><small>Payment Gateway</small>"]
```

### Dark Mode Handling

When the user toggles themes, Mermaid diagrams need to re-render:

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.dataset.theme === 'light';
  html.dataset.theme = isLight ? '' : 'light';
  // Re-render Mermaid with new theme
  location.reload();
}
```

For smoother transitions, you can re-initialize Mermaid with new themeVariables instead of reloading, but a reload is simpler and more reliable.

### Which Mermaid Diagram Type?

Quick-reference table:

| Content | Diagram Type | Syntax Start |
|---|---|---|
| System components + connections | `flowchart` | `graph TD` or `graph LR` |
| Request/response between services | `sequenceDiagram` | `sequenceDiagram` |
| Database schema + relationships | `erDiagram` | `erDiagram` |
| Application states + transitions | `stateDiagram-v2` | `stateDiagram-v2` |
| Brainstorm / taxonomy | `mindmap` | `mindmap` |
| OOP class structure | `classDiagram` | `classDiagram` |
| System boundaries (C4-style) | `flowchart` + subgraphs | `graph TD` with `subgraph` |
| Project phases | `gantt` | `gantt` |
| Git branching | `gitgraph` | `gitgraph` |

---

## Chart.js

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
```

### Dark Mode Aware Config

```javascript
const isDark = document.documentElement.dataset.theme !== 'light';

const chartColors = {
  text: isDark ? '#d0d0d0' : '#2d3b35',
  grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  accent: isDark ? '#5a9e8e' : '#3d7a6a',
};

new Chart(document.getElementById('myChart'), {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      data: [10, 20, 15],
      backgroundColor: chartColors.accent + '80',
      borderColor: chartColors.accent,
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { color: chartColors.text } }
    },
    scales: {
      x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
      y: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } }
    }
  }
});
```

### Canvas Wrapper CSS

```css
.chart-wrap {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 1rem auto;
}
.chart-wrap canvas {
  width: 100% !important;
  height: auto !important;
}
```

---

## anime.js

Use for orchestrated animations when you have 10+ elements that need coordinated motion. For simpler animations, CSS `@keyframes` with stagger delays is sufficient.

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
```

### Initial Opacity Pattern

Elements animated with anime.js should start invisible to prevent flash:

```css
.animate-target { opacity: 0; }
```

```javascript
anime({
  targets: '.animate-target',
  opacity: [0, 1],
  translateY: [20, 0],
  delay: anime.stagger(60),
  duration: 500,
  easing: 'easeOutCubic'
});
```

---

## Google Fonts

### Forbidden Fonts

Never use: Inter, Roboto, Arial, Helvetica, `system-ui` alone. These are generic defaults that make pages look AI-generated.

### Font Pairings

Import via Google Fonts CDN:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=FONT+NAME:wght@400;600;700&display=swap" rel="stylesheet">
```

| Heading Font | Body Font | Voice | Best For |
|---|---|---|---|
| IBM Plex Sans | IBM Plex Mono | Technical, precise | Architecture, system docs |
| Source Serif 4 | Source Sans 3 | Editorial, authoritative | Reports, reviews, analysis |
| DM Serif Display | DM Sans | Bold, modern | Dashboards, landing pages |
| Fraunces | Commissioner | Warm, approachable | Blog posts, feature announcements |
| Instrument Serif | Instrument Sans | Elegant, refined | Data tables, financial reports |
| Space Grotesk | Space Mono | Futuristic, technical | CLI tools, terminal-adjacent |
| Playfair Display | Lato | Classic, professional | Executive summaries, proposals |
| Outfit | JetBrains Mono | Clean, developer | Code reviews, technical specs |
| Sora | Nunito Sans | Friendly, modern | Product docs, user guides |
| Crimson Pro | Work Sans | Scholarly, structured | Research, deep dives |
| Bitter | Karla | Serious, readable | Long-form analysis, audit reports |
| Josefin Sans | Mulish | Geometric, minimal | Timelines, roadmaps |
| Libre Baskerville | Libre Franklin | Trustworthy, editorial | Status reports, project recaps |

### Typography by Content Voice

| Content Type | Recommended Pairing | Notes |
|---|---|---|
| Architecture diagram | IBM Plex Sans + IBM Plex Mono | Monospace for node labels |
| Dashboard / metrics | DM Serif Display + DM Sans | Hero numbers pop with serif |
| Code review | Outfit + JetBrains Mono | Developer-native feel |
| Project recap | Libre Baskerville + Libre Franklin | Professional, trustworthy |
| Implementation plan | Source Serif 4 + Source Sans 3 | Authoritative structure |
| Data table | Instrument Serif + Instrument Sans | Tabular nums shine here |
| Timeline / roadmap | Josefin Sans + Mulish | Clean geometric lines |
| Blog / article | Fraunces + Commissioner | Warm, inviting long-form |
| Executive summary | Playfair Display + Lato | Classic professionalism |
