---
name: frontend-design
description: "Create distinctive frontend interfaces: components, pages, dashboards, React, HTML/CSS. Polished code, no generic AI aesthetics."
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. Avoid converging on the same fonts across generations. **Exception:** When mk3y-design is active, use its specified fonts (Space Grotesk + JetBrains Mono).

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Rules

### Accessibility

- Icon-only buttons need `aria-label`
- Form controls need `<label>` or `aria-label`
- Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`)
- `<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)
- Images need `alt` (or `alt=""` if decorative)
- Decorative icons need `aria-hidden="true"`
- Async updates (toasts, validation) need `aria-live="polite"`
- Use semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`) before ARIA
- Headings hierarchical `<h1>`–`<h6>`; include skip link for main content
- `scroll-margin-top` on heading anchors

### Focus States

- Interactive elements need visible focus: `focus-visible:ring-*` or equivalent
- Never `outline-none` / `outline: none` without focus replacement
- Use `:focus-visible` over `:focus` (avoid focus ring on click)
- Group focus with `:focus-within` for compound controls

### Forms

- Inputs need `autocomplete` and meaningful `name`
- Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Never block paste (`onPaste` + `preventDefault`)
- Labels clickable (`htmlFor` or wrapping control)
- Disable spellcheck on emails, codes, usernames (`spellCheck={false}`)
- Checkboxes/radios: label + control share single hit target (no dead zones)
- Submit button stays enabled until request starts; spinner during request
- Errors inline next to fields; focus first error on submit
- Placeholders end with `…` and show example pattern
- `autocomplete="off"` on non-auth fields to avoid password manager triggers
- Warn before navigation with unsaved changes (`beforeunload` or router guard)
- Mark required fields explicitly (asterisk or `(required)` text)
- Password fields: include a show/hide visibility toggle

### Animation

- Honor `prefers-reduced-motion` (provide reduced variant or disable)
- Animate `transform`/`opacity` only (compositor-friendly)
- Never `transition: all`—list properties explicitly
- Set correct `transform-origin`
- SVG: transforms on `<g>` wrapper with `transform-box: fill-box; transform-origin: center`
- Animations interruptible—respond to user input mid-animation
- Duration: 150–300ms for micro-interactions; never >500ms for UI transitions
- Easing: `ease-out` for entering, `ease-in` for exiting; never `linear` for UI

### Typography

- `…` not `...`
- Curly quotes `"` `"` not straight `"`
- Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- Loading states end with `…`: `"Loading…"`, `"Saving…"`
- `font-variant-numeric: tabular-nums` for number columns/comparisons
- Use `text-wrap: balance` or `text-pretty` on headings (prevents widows)
- Body line-height 1.5–1.75; tighter for headings (1.1–1.3)
- Body line-length 65–75ch max (use `max-w-prose` or equivalent)
- Mobile body text minimum 16px (anything smaller triggers iOS zoom-on-focus)
- Use a consistent modular scale for sizes—no arbitrary one-off values

### Content Handling

- Text containers handle long content: `truncate`, `line-clamp-*`, or `break-words`
- Flex children need `min-w-0` to allow text truncation
- Handle empty states—don't render broken UI for empty strings/arrays
- User-generated content: anticipate short, average, and very long inputs

### Images

- `<img>` needs explicit `width` and `height` (prevents CLS)
- Below-fold images: `loading="lazy"`
- Above-fold critical images: `priority` or `fetchpriority="high"`

### Performance

- Large lists (>50 items): virtualize (`virtua`, `content-visibility: auto`)
- No layout reads in render (`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`)
- Batch DOM reads/writes; avoid interleaving
- Prefer uncontrolled inputs; controlled inputs must be cheap per keystroke
- Add `<link rel="preconnect">` for CDN/asset domains
- Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`

### Navigation & State

- URL reflects state—filters, tabs, pagination, expanded panels in query params
- Links use `<a>`/`<Link>` (Cmd/Ctrl+click, middle-click support)
- Deep-link all stateful UI (if uses `useState`, consider URL sync via nuqs or similar)
- Destructive actions need confirmation modal or undo window—never immediate

### Touch & Interaction

- `touch-action: manipulation` (prevents double-tap zoom delay)
- `-webkit-tap-highlight-color` set intentionally
- `overscroll-behavior: contain` in modals/drawers/sheets
- During drag: disable text selection, `inert` on dragged elements
- `autoFocus` sparingly—desktop only, single primary input; avoid on mobile
- Touch targets minimum 44×44px (WCAG 2.5.5)
- Minimum 8px spacing between adjacent touch targets
- Never rely on hover alone for primary actions—touch devices have no hover

### Safe Areas & Layout

- Full-bleed layouts need `env(safe-area-inset-*)` for notches
- Avoid unwanted scrollbars: `overflow-x-hidden` on containers, fix content overflow
- Flex/grid over JS measurement for layout
- Use `dvh` (dynamic viewport height) instead of `100vh` for full-screen mobile layouts — `100vh` breaks under mobile browser chrome
- Define a z-index scale (e.g. 10/20/30/50/100) and stick to it; never arbitrary `z-index: 9999`

### Dark Mode & Theming

- `color-scheme: dark` on `<html>` for dark themes (fixes scrollbar, inputs)
- `<meta name="theme-color">` matches page background
- Native `<select>`: explicit `background-color` and `color` (Windows dark mode)

### Locale & i18n

- Dates/times: use `Intl.DateTimeFormat` not hardcoded formats
- Numbers/currency: use `Intl.NumberFormat` not hardcoded formats
- Detect language via `Accept-Language` / `navigator.languages`, not IP

### Hydration Safety

- Inputs with `value` need `onChange` (or use `defaultValue` for uncontrolled)
- Date/time rendering: guard against hydration mismatch (server vs client)
- `suppressHydrationWarning` only where truly needed

### Hover & Interactive States

- Buttons/links need `hover:` state (visual feedback)
- Interactive states increase contrast: hover/active/focus more prominent than rest
- Disabled state: reduced opacity + `cursor-not-allowed`; visually distinct from enabled
- Loading buttons: disable + spinner during request (prevents double-submit)

### Feedback

- Show a loading indicator for any operation > ~300ms (spinner or skeleton)
- Skeletons over spinners when you can match the final shape
- Toast notifications auto-dismiss in 3–5 seconds; never permanent
- Multi-step processes need a progress indicator (steps or bar)
- Confirm successful destructive/async actions visually—silence reads as failure

### Content & Copy

- Active voice: "Install the CLI" not "The CLI will be installed"
- Title Case for headings/buttons (Chicago style)
- Numerals for counts: "8 deployments" not "eight"
- Specific button labels: "Save API Key" not "Continue"
- Error messages include fix/next step, not just problem
- Second person; avoid first person
- `&` over "and" where space-constrained

### Tailwind Patterns

- Define a **z-index scale** in config (`z-10 / z-20 / z-30 / z-40 / z-50`). Never arbitrary `z-[9999]`. Fixed nav → `z-50`, dropdowns → `z-40`.
- **Opacity utilities** over separate opacity classes: `bg-black/50`, `text-white/80`.
- **Theme colors directly**: `bg-primary`, `text-success` — never `bg-[var(--color-primary)]`.
- **Space utilities** over per-child margins: `space-y-4`, `space-x-2`, `gap-4` on flex/grid.
- **`group` / `peer`** for parent/sibling-state styling — don't reach for JS for simple hover/focus reveal.
- **Arbitrary values `[...]`** for genuine one-offs (`w-[350px]`); if it's reused, add it to the theme.
- **`size-*`** for square dimensions (`size-6`) instead of separate `w-6 h-6`.
- **`shrink-0`** / `shrink` shorthands over `flex-shrink-0`.
- **Container queries**: `@container` + `@lg:` for component-internal responsiveness — media queries are for the page, container queries are for the component.
- **Dark mode** via `dark:` prefix on the same element, not a parallel stylesheet.
- **Animate utilities** (`animate-pulse`, `animate-spin`) over hand-rolled `@keyframes` for common effects. `animate-bounce` only on a single CTA, never multiples (motion sickness).
- **Transition durations** in the 150–300ms band: `duration-150` to `duration-300`. Never `duration-1000+` for UI.
- **`focus-visible:ring-2`** for keyboard focus, not `focus:ring-2` (avoids ring on mouse click).
- **`motion-reduce:animate-none`** on anything that animates to honor `prefers-reduced-motion`.
- **Min height for touch**: `min-h-[44px]` on mobile buttons.
- **`disabled:` variants**: `disabled:opacity-50 disabled:cursor-not-allowed` on interactive elements.
- **Prose plugin** (`@tailwindcss/typography`): `prose prose-lg` for long-form/markdown content instead of restyling headings manually.
- **Configure `content` paths** in `tailwind.config` precisely — anything missed gets purged at build.
- **Avoid `@apply` bloat** — utilities in markup beat a wall of `@apply` rules. Use it sparingly for true component-level abstractions.
- **Official plugins** over hand-rolls: `@tailwindcss/forms`, `typography`, `aspect-ratio`.
- **SVG explicit dimensions**: `<svg class="size-6" width="24" height="24">` — prevents layout shift before CSS loads.
- **v4 gradient syntax**: `bg-linear-to-r` (the old `bg-gradient-to-r` is deprecated in v4).

### Anti-patterns (flag these)

- `user-scalable=no` or `maximum-scale=1` disabling zoom
- `onPaste` with `preventDefault`
- `transition: all`
- `outline-none` without focus-visible replacement
- Inline `onClick` navigation without `<a>`
- `<div>` or `<span>` with click handlers (should be `<button>`)
- Images without dimensions
- Large arrays `.map()` without virtualization
- Form inputs without labels
- Icon buttons without `aria-label`
- Hardcoded date/number formats (use `Intl.*`)
- `autoFocus` without clear justification

## Tips for Better Results

1. **Be specific with keywords** - "healthcare SaaS dashboard" > "app"
2. **Search multiple times** - Different keywords reveal different insights
3. **Combine domains** - Style + Typography + Color = Complete design system
4. **Always check UX** - Search "animation", "z-index", "accessibility" for common issues
5. **Use stack flag** - Get implementation-specific best practices
6. **Iterate** - If first search doesn't match, try different keywords

------

## Common Rules for Professional UI

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule                       | Do                                              | Don't                                  |
| -------------------------- | ----------------------------------------------- | -------------------------------------- |
| **No emoji icons**         | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons      |
| **Stable hover states**    | Use color/opacity transitions on hover          | Use scale transforms that shift layout |
| **Correct brand logos**    | Research official SVG from Simple Icons         | Guess or use incorrect logo paths      |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6          | Mix different icon sizes randomly      |

### Interaction & Cursor

| Rule                   | Do                                                    | Don't                                        |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------- |
| **Cursor pointer**     | Add `cursor-pointer` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback**     | Provide visual feedback (color, shadow, border)       | No indication element is interactive         |
| **Smooth transitions** | Use `transition-colors duration-200`                  | Instant state changes or too slow (>500ms)   |

### Light/Dark Mode Contrast

| Rule                      | Do                                  | Don't                                   |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| **Glass card light mode** | Use `bg-white/80` or higher opacity | Use `bg-white/10` (too transparent)     |
| **Text contrast light**   | Use `#0F172A` (slate-900) for text  | Use `#94A3B8` (slate-400) for body text |
| **Muted text light**      | Use `#475569` (slate-600) minimum   | Use gray-400 or lighter                 |
| **Border visibility**     | Use `border-gray-200` in light mode | Use `border-white/10` (invisible)       |

### Layout & Spacing

| Rule                     | Do                                  | Don't                                  |
| ------------------------ | ----------------------------------- | -------------------------------------- |
| **Floating navbar**      | Add `top-4 left-4 right-4` spacing  | Stick navbar to `top-0 left-0 right-0` |
| **Content padding**      | Account for fixed navbar height     | Let content hide behind fixed elements |
| **Consistent max-width** | Use same `max-w-6xl` or `max-w-7xl` | Mix different container widths         |

------

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality

-  No emojis used as icons (use SVG instead)
-  All icons from consistent icon set (Heroicons/Lucide)
-  Brand logos are correct (verified from Simple Icons)
-  Hover states don't cause layout shift
-  Use theme colors directly (bg-primary) not var() wrapper

### Interaction

-  All clickable elements have `cursor-pointer`
-  Hover states provide clear visual feedback
-  Transitions are smooth (150-300ms)
-  Focus states visible for keyboard navigation

### Light/Dark Mode

-  Light mode text has sufficient contrast (4.5:1 minimum)
-  Glass/transparent elements visible in light mode
-  Borders visible in both modes
-  Test both modes before delivery

### Layout

-  Floating elements have proper spacing from edges
-  No content hidden behind fixed navbars
-  Responsive at 375px, 768px, 1024px, 1440px
-  No horizontal scroll on mobile

### Accessibility

-  All images have alt text
-  Form inputs have labels
-  Color is not the only indicator
-  `prefers-reduced-motion` respected