---
name: mk3y-design
description: Mike's personal design system. Invoke when asked to style, design, or build UI with "mk3y-design", "my design system", "use my style", or when building any UI for Mike's personal projects (Scaffold, Knitly, 1337hero, homelab dashboards). Provides design tokens, component patterns, and aesthetic direction. Works with any output format (HTML, React, Tailwind, CSS).
---

# mk3y-design

A parameterizable design system built around dark layered surfaces, warm amber accents, and clean typographic hierarchy. Apply to any output format.

## Default Theme: Dark Amber

### Surfaces (4-depth system)

Every UI is built on layered surfaces that create depth without shadows:

```
--bg:        #0c0c12    /* Page background, deepest layer */
--surface:   #13131d    /* Cards, panels, primary containers */
--surface-2: #1a1a28    /* Elevated elements, hover states, nested containers */
--surface-3: #222233    /* Highest elevation, popovers, dropdowns */
```

### Borders

```
--border:       #2a2a3e  /* Default card/container borders */
--border-light: #33334a  /* Hover states, active elements, focus rings */
```

### Text (3-tier hierarchy)

```
--text:       #e8e8f0    /* Primary content, headings, important labels */
--text-dim:   #7a7a96    /* Secondary content, descriptions, inactive tabs */
--text-muted: #55556a    /* Tertiary: timestamps, counts, helper text */
```

### Accent Colors

Each accent has a `-dim` variant at 10-12% opacity for backgrounds:

```
--primary:     #f59e0b   /* Amber — primary actions, focus, "The One" highlights */
--primary-dim: rgba(245, 158, 11, 0.12)

--success:     #34d399   /* Green — completed, positive, progress */
--success-dim: rgba(52, 211, 153, 0.12)

--info:        #60a5fa   /* Blue — informational, links, secondary projects */
--info-dim:    rgba(96, 165, 250, 0.1)

--accent:      #a78bfa   /* Purple — creative, ideas, accent highlights */
--accent-dim:  rgba(167, 139, 250, 0.1)

--neutral:     #06b6d4   /* Cyan — neutral emphasis, tags */

--danger:      #f87171   /* Red — destructive, errors, warnings */
--danger-dim:  rgba(239, 68, 68, 0.1)
```

### Typography

**Font pairing:** Display + Monospace. Never use system fonts.

```
--font-display: 'Space Grotesk', sans-serif   /* Headings, body, UI labels */
--font-mono:    'JetBrains Mono', monospace    /* Code, timestamps, counts, badges */
```

Google Fonts import:
```
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

**Type scale:**
- Page title: 1.5rem, weight 700, letter-spacing -0.03em
- Section title: 1.4rem, weight 700, letter-spacing -0.02em
- Card title: 0.95-1.05rem, weight 600
- Body: 0.82-0.88rem
- Small labels: 0.72-0.78rem, weight 500
- Micro labels: 0.62-0.68rem, weight 600, uppercase, letter-spacing 0.06-0.12em
- Mono values: 0.68-0.75rem (timestamps, counts, badge text)

### Border Radii

```
--radius-micro: 4px      /* Checkmarks, small indicators */
--radius-sm:    6px       /* Chips, badges, pill buttons */
--radius-md:    8px       /* Buttons, tabs, inputs */
--radius-lg:    10px      /* Standard cards */
--radius-xl:    12px      /* Featured cards, modals */
```

## Component Patterns

### Cards

**Standard card:**
```
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--radius-lg) to var(--radius-xl);
padding: 20-24px;
```

Hover: `border-color: var(--border-light)`

**Featured card (e.g., "The One"):**
Same as standard plus:
```
border-left: 3px solid var(--primary);
padding: 24px;
```

**Muted/done card:**
```
opacity: 0.45;
text-decoration: line-through on title;
```

### Badges & Pills

**Type badge** (e.g., "video", "idea", "task"):
```
font-size: 0.62rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.06em;
padding: 3px 8px;
border-radius: var(--radius-micro);
background: var(--{color}-dim);
color: var(--{color});
```

**Meta tag:**
```
font-size: 0.65rem;
padding: 2px 8px;
border-radius: var(--radius-micro);
background: var(--surface-3);
color: var(--text-dim);
```

**Count badge (inline):**
```
font-family: var(--font-mono);
font-size: 0.65rem;
background: var(--primary-dim);
color: var(--primary);
padding: 1px 6px;
border-radius: var(--radius-micro);
```

### Navigation

**Tab bar:**
```
display: flex; justify-content: center; gap: 4px;
sticky top with bg background and bottom border.
```

**Tab:**
```
padding: 10px 24px;
border-radius: var(--radius-md);
font-size: 0.85rem; font-weight: 500;
border: 1px solid transparent;
```
- Default: transparent bg, text-dim color
- Hover: surface bg, text color
- Active: surface-2 bg, border-color border, text color

### Filter Chips

```
font-size: 0.72rem; font-weight: 500;
padding: 5px 12px;
border-radius: var(--radius-sm);
border: 1px solid var(--border);
```
Active: surface-2 bg, text color, border-light

### Section Dividers

```
display: flex; align-items: center; gap: 12px;
```
- Label: 0.68rem, weight 600, uppercase, letter-spacing 0.1em, text-muted
- Line: flex: 1, height: 1px, border color
- Optional count: mono font, 0.68rem, text-muted

### Inputs

**Capture/search bar (typically fixed bottom):**
```
background: var(--surface-2);
border: 1px solid var(--border);
border-radius: var(--radius-lg);
padding: 14px 18px;
font-family: var(--font-display);
font-size: 0.88rem;
```
Focus: `border-color: var(--primary)`
Placeholder: text-muted color

**Send/action button (positioned inside input):**
```
background: var(--primary-dim);
border: 1px solid rgba(245, 158, 11, 0.2);
color: var(--primary);
padding: 7px 14px;
border-radius: 7px;
font-size: 0.75rem; font-weight: 600;
```

### Checkboxes

**Standard (22x22):**
```
border-radius: var(--radius-sm);
border: 2px solid var(--border-light);
```
- Hover: border primary, primary-dim bg
- Checked: border success, success-dim bg, checkmark in success color

**Micro (16x16):** Same pattern, smaller, 4px radius

### Action Buttons

```
font-size: 0.72rem; font-weight: 500;
padding: 5px 12px;
border-radius: var(--radius-sm);
border: 1px solid var(--border);
```
- Default: transparent bg, text-dim
- Hover: surface-3 bg, text color
- Primary variant: primary-dim bg, primary border at 20% opacity, primary text

### Progress Bars

```
Track: surface-2, 4px height, 2px radius
Fill: linear-gradient(90deg, var(--success), var(--primary))
Label: mono font, 0.72rem, text-muted
```

## Parameterization

### Swapping the Primary Accent

Replace `--primary` and `--primary-dim` throughout. The rest of the system stays intact.

Examples:
- Cyan primary: `--primary: #06b6d4; --primary-dim: rgba(6, 182, 212, 0.12);`
- Blue primary: `--primary: #60a5fa; --primary-dim: rgba(96, 165, 250, 0.1);`
- Green primary: `--primary: #34d399; --primary-dim: rgba(52, 211, 153, 0.12);`

### Light Mode Variant

Invert the surface ramp:
```
--bg:        #f8f9fa
--surface:   #ffffff
--surface-2: #f1f3f5
--surface-3: #e9ecef
--border:    #dee2e6
--border-light: #ced4da
--text:      #0f172a
--text-dim:  #475569
--text-muted: #94a3b8
```

Accents stay the same but may need darker variants for contrast.

### Alternative Font Pairs

| Pair | Display | Mono | Vibe |
|------|---------|------|------|
| **Default** | Space Grotesk | JetBrains Mono | Clean technical |
| **Editorial** | Instrument Serif | IBM Plex Mono | Warm, literary |
| **Geometric** | Satoshi | Fira Code | Modern, precise |
| **Humanist** | General Sans | Source Code Pro | Approachable |

### Preset Variants

Request by name:

- **"default"** — Dark/amber, Space Grotesk + JetBrains Mono
- **"light"** — Light surfaces, same accents
- **"warm"** — Dark warm grays, orange-red primary, Instrument Serif
- **"cool"** — Dark blue-grays, cyan primary, Satoshi

## Output Format Rules

### Standalone HTML
- All CSS vars in `:root` block
- Google Fonts `@import` in `<style>` tag
- Everything self-contained in one file
- No external dependencies

### React / Preact
- CSS vars in a global stylesheet or CSS module
- Components use `var(--token)` references
- If Tailwind: extend config with custom tokens

### Tailwind
```js
// tailwind.config.js extend section
colors: {
  bg: '#0c0c12',
  surface: { DEFAULT: '#13131d', 2: '#1a1a28', 3: '#222233' },
  border: { DEFAULT: '#2a2a3e', light: '#33334a' },
  text: { DEFAULT: '#e8e8f0', dim: '#7a7a96', muted: '#55556a' },
  primary: { DEFAULT: '#f59e0b', dim: 'rgba(245, 158, 11, 0.12)' },
  success: { DEFAULT: '#34d399', dim: 'rgba(52, 211, 153, 0.12)' },
  info: { DEFAULT: '#60a5fa', dim: 'rgba(96, 165, 250, 0.1)' },
  accent: { DEFAULT: '#a78bfa', dim: 'rgba(167, 139, 250, 0.1)' },
  danger: { DEFAULT: '#f87171', dim: 'rgba(239, 68, 68, 0.1)' },
}
```

## Usage

Invoke this skill when:
- Building UI for Mike's projects
- User says "use mk3y-design", "my design system", "style this", "use my style"
- Creating mockups, prototypes, dashboards, or pages

Combine with `frontend-design` skill for full coverage: mk3y-design handles the look, frontend-design handles structure, accessibility, and implementation rules.
