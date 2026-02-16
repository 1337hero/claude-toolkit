---
description: Generate a visual project status snapshot — recent activity, decisions, mental model, next steps
argument-hint: [2w|30d|3m|free-form context]
---

# Project Recap

Generate a comprehensive visual project recap as a self-contained HTML page.

## Variables

WINDOW: $ARGUMENTS

## Time Window

Parse WINDOW:
- Shorthand (`2w`, `30d`, `3m`) → git `--since` format (`"2 weeks ago"`, `"30 days ago"`, `"3 months ago"`)
- Doesn't match time pattern → treat as free-form context, use default window
- No argument → default `2w`

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read `~/Claude/skills/visual-explainer/references/css-patterns.md`.
2. **Data gathering** (all before HTML):
   - Read `README.md`, `CHANGELOG.md`, `package.json`/`Cargo.toml`/`pyproject.toml` for name, version, deps
   - `git log --oneline --since=<window>` — commit history
   - `git log --stat --since=<window>` — file-level change scope
   - `git shortlog -sn --since=<window>` — activity by contributor
   - `git status` — uncommitted changes
   - `git branch --no-merged` — stale branches
   - Check `~/Claude/projects/` and `~/Claude/memories/` for progress docs
   - Mine conversation history for decision rationale
3. **Verification checkpoint**: fact sheet — commit counts, file counts, module names, behavior descriptions, each with source citation. Mark unverifiable as uncertain.
4. **Generate HTML** with these sections:
   1. Project identity (current-state summary, version, key deps, elevator pitch)
   2. Architecture snapshot (Mermaid diagram — conceptual modules + relationships, zoom controls, hero depth)
   3. Recent activity (narrative grouped by theme: features, fixes, refactors, infra — not raw git log)
   4. Decision log (key decisions from window — what, why, what was considered)
   5. State of things (KPI cards: working / in-progress / broken / blocked with color-coded trend indicators)
   6. Mental model essentials (5-10 invariants, non-obvious coupling, gotchas, naming conventions)
   7. Cognitive debt hotspots (amber cards with severity borders — red/amber/blue — plus concrete suggestions)
   8. Next steps (inferred from momentum, TODOs, plan files — not prescriptive)
5. Write to `~/.agent/diagrams/project-recap-<name>.html`
6. Open with `xdg-open ~/.agent/diagrams/<filename>.html`

**Aesthetic:** warm editorial — muted blues and greens for architecture, amber for cognitive debt, green/blue/amber/red for state-of-things.

Ultrathink.
