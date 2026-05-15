---
name: scaffold-astro
description: "Scaffold or restructure Astro projects with Bun + Tailwind. Trigger: scaffold astro, new astro project."
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

## Astro Framework Idioms

Beyond directory structure, lean on what Astro gives you:

### Islands & client directives
- Default to **zero JS**. Static markup stays in `.astro` components.
- Reach for a framework component (React/Preact) only when you need real interactivity, and pair it with the right client directive:
  - `client:load` — hydrate immediately (rare; only above-fold critical interactivity)
  - `client:idle` — hydrate when the browser is idle (most interactive widgets)
  - `client:visible` — hydrate when scrolled into view (below-fold)
  - `client:media` — hydrate only when a media query matches
- Audit `client:*` usage regularly. Each directive ships JS.

### Content collections
- Use **content collections** for any structured content (blog, docs, projects) — not loose markdown + `Astro.glob`.
- Define a **Zod schema** per collection in `src/content/config.ts` so frontmatter is type-checked.
- Read collections with `getCollection('blog')` / `getEntry('blog', slug)`.

### Slots over content props
- Compose layouts with `<slot />` (default) and named slots (`<slot name="header" />`).
- Don't pass HTML as a prop string.

### Styling
- `<style>` blocks in `.astro` files are **scoped by default** — keep it that way.
- `is:global` only for true global overrides; never for component styles.

### Images
- `import { Image, Picture } from 'astro:assets'` — the built-in `<Image />` optimizes local images.
- Use `<Picture />` for art direction / multiple formats.
- Never `<img>` for local image assets.

### View Transitions
- Add `<ViewTransitions />` in `BaseHead.astro` for smooth page transitions.
- `transition:name="hero"` on elements that should morph across pages.
- `transition:persist` on stateful elements (audio/video players, sidebars) that must survive navigation.

### SEO defaults
- Use `@astrojs/sitemap` for automatic sitemap generation.
- Use `@astrojs/rss` for content sites that need a feed.
- Canonical URL: `<link rel="canonical" href={Astro.url}>` in `BaseHead.astro`.

### Rendering mode
- Pure marketing site → `output: 'static'`.
- Mix of static + dynamic routes → `output: 'hybrid'`.
- Fully dynamic app → `output: 'server'` with the right adapter.
- Don't reach for SSR unless a page genuinely needs per-request data.

### Security
- `set:html` only on **trusted** content. Never on raw user input.
- Validate API route input with Zod before doing anything with it.

### Performance
- `prefetch` integration for instant subsequent navigations.
- Run `bun run build` and check the JS bundle output — anything unexpected? Audit your client directives.

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
