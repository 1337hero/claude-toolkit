---
name: scaffold-astro
description: Scaffold and structure Astro projects following established conventions. Use when creating a new Astro site, restructuring an existing Astro project, or when the user says "scaffold astro", "new astro project", "set up an astro site", or wants to reorganize an Astro codebase to follow standard patterns. Handles Bun + Tailwind setup, component extraction, and directory organization.
---

# Scaffold Astro

Scaffold or restructure Astro projects using a consistent, proven directory structure and separation of concerns.

## Gather Info

Ask the user (use AskUserQuestion):

1. **Site name** — used in package.json `name` field and consts.ts
2. **Site description** — for meta tags and consts.ts
3. **Site URL** — for consts.ts (e.g. `https://example.com`)
4. **New or restructure?** — fresh project vs reorganizing existing code

If restructuring, also ask if they want the old files archived (`_archive/` pattern).

## Directory Structure

Every project follows this layout:

```
src/
├── components/      # PascalCase .astro files — one per UI concern
│   ├── BaseHead.astro   # <head> meta, fonts, title — reads from consts.ts
│   ├── Header.astro     # Site nav — reads SITE_TITLE from consts.ts
│   └── Footer.astro     # Site footer with dynamic copyright year
├── data/            # Typed data exports (arrays, objects)
│   └── social.ts
├── layouts/
│   └── Layout.astro # Composes BaseHead + Header + <slot /> + Footer, imports global.css
├── pages/           # Thin — import Layout + section components, minimal logic
│   └── index.astro
├── styles/
│   └── global.css   # All global styles, CSS custom properties
└── consts.ts        # SITE_TITLE, SITE_DESCRIPTION, SITE_URL
```

## Rules

- **Bun only** — `bun install`, `bun run dev`, never npm/yarn/pnpm
- **Dev server port 4001** — set in astro.config.mjs
- **Components are PascalCase** — `Header.astro`, `Services.astro`
- **Pages are thin** — import Layout + section components, compose them, done
- **No barrel files** — no `index.ts` re-exports, ever
- **Layout owns the shell** — `<html>`, `<head>`, `<body>` live in Layout.astro
- **Components own their markup** — each section of a page is its own component
- **Data in `src/data/`** — typed arrays/objects as named exports
- **Constants in `src/consts.ts`** — site-wide strings (title, description, URL)
- **CSS in `styles/global.css`** — custom properties in `:root`, component styles grouped with comment headers
- **BaseHead.astro handles `<head>`** — meta tags, fonts, title prop, OG tags

## New Project Workflow

1. Copy template files from `assets/template/` into the project root
2. Replace `{{SITE_NAME}}`, `{{SITE_TITLE}}`, `{{SITE_DESCRIPTION}}`, `{{SITE_URL}}` placeholders with actual values
3. Run `bun install`
4. Add fonts to BaseHead.astro if the design requires custom fonts (Google Fonts `<link>` or local `@font-face` in global.css)
5. Build out section components based on the design
6. Compose section components in `index.astro`
7. Run `bun run build` to verify

## Restructure Workflow

When reorganizing an existing Astro project:

1. **Archive first** — `mkdir _archive && mv src astro.config.mjs tailwind.config.mjs tsconfig.json package.json bun.lock public .astro _archive/`
2. **Add to .gitignore** — append `_archive` so the old demos stay runnable but out of version control
3. **Scaffold fresh** — copy template files, replace placeholders
4. **Extract components** — break existing page markup into separate component files:
   - Each `<section>` or major UI block becomes its own component
   - Nav becomes `Header.astro`
   - Move `<head>` contents into `BaseHead.astro`
   - Move inline `<style>` blocks into `global.css`
   - Data arrays (links, social, services) move to `src/data/`
5. **Thin out pages** — `index.astro` should just import and compose
6. Run `bun install && bun run build` to verify

## Section Component Pattern

When a page has distinct sections (hero, services, about, contact, etc.), each becomes its own component:

```astro
<!-- src/pages/index.astro -->
---
import Layout from "../layouts/Layout.astro";
import Hero from "../components/Hero.astro";
import Services from "../components/Services.astro";
import About from "../components/About.astro";
import Contact from "../components/Contact.astro";
---

<Layout title="Site Title">
  <Hero />
  <Services />
  <About />
  <Contact />
</Layout>
```

Components that need data import it from `src/data/`:

```astro
<!-- src/components/Contact.astro -->
---
import { socialLinks } from "../data/social";
---

<section id="contact">
  {socialLinks.map((link) => (
    <a href={link.url}>{link.name}</a>
  ))}
</section>
```

## Template Assets

Template files live at `assets/template/`. Copy them to the project root and customize. Files include:

- `package.json` — Astro + Tailwind + Bun
- `astro.config.mjs` — Tailwind integration, port 4001
- `tailwind.config.mjs` — content paths configured
- `tsconfig.json` — extends astro/tsconfigs/strict
- `.gitignore` — node_modules, dist, .astro, .env
- `src/consts.ts` — site constants with placeholders
- `src/components/BaseHead.astro` — head meta template
- `src/components/Header.astro` — minimal nav
- `src/components/Footer.astro` — copyright year
- `src/layouts/Layout.astro` — full page shell
- `src/pages/index.astro` — starter page
- `src/styles/global.css` — Tailwind directives + CSS vars
- `src/data/social.ts` — social links starter
