# mk3y-design Skill Design

**Date:** 2026-02-20
**Status:** Approved

## Purpose

Capture Mike's design language (extracted from HTML Structured output style) as a reusable skill. Apply to any output format — standalone HTML, React/Preact, Tailwind, etc.

## Token Architecture

### Surfaces (4-depth system)
- bg: #0c0c12, surface: #13131d, surface-2: #1a1a28, surface-3: #222233
- Borders: #2a2a3e (default), #33334a (hover/active)

### Text (3-tier hierarchy)
- text: #e8e8f0, text-dim: #7a7a96, text-muted: #55556a

### Accents (each with -dim variant at ~10-12% opacity)
- primary/amber: #f59e0b, success/green: #34d399, info/blue: #60a5fa
- accent/purple: #a78bfa, neutral/cyan: #06b6d4, danger/red: #f87171

### Typography
- Display: Space Grotesk (300-700)
- Mono: JetBrains Mono (400-600)

### Radii
- 4px (micro), 6-8px (chips/badges), 10-12px (cards)

## Component Patterns

Cards, badges/pills, nav tabs, filter chips, section dividers, capture bars, custom checkboxes, micro-checkboxes, hover states, typography patterns (uppercase labels, mono timestamps, tight-tracked titles).

## Parameterization

Default theme + documented swap points for: surface ramp, primary accent, font pairs. Preset variants: Default (dark/amber), Light, Warm, Cool.

## Skill Invocation

- Standalone: "Build X using mk3y-design"
- With frontend-design: mk3y-design handles look, frontend-design handles structure/a11y
- Partial: "Style this using mk3y-design tokens"
