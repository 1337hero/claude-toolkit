---
description: Generate a visual HTML code review — before/after architecture, KPIs, decision log
argument-hint: [branch|commit|PR number|HEAD]
---

# Diff Review

Generate a visual HTML code change analysis and open it in the browser.

## Variables

TARGET: $ARGUMENTS

## Scope Detection

Determine what to diff from TARGET:
- Branch name → working tree vs. that branch
- Commit hash → that specific commit's diff
- `HEAD` → uncommitted changes only
- PR number → `gh pr diff <number>`
- Commit range (A..B) → diff between two commits
- No argument → defaults to `main`

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read `~/Claude/skills/visual-explainer/references/css-patterns.md`.
2. **Data gathering** (run all before generating HTML):
   - `git diff --stat` for file overview
   - `git diff --name-status` separating source from tests
   - Read all changed files in full with surrounding context
   - Grep for new public API surface
   - Check `CHANGELOG.md`, `README.md`, `docs/` for updates
   - Mine conversation history for decision rationale
3. **Verification checkpoint**: produce a fact sheet — every quantitative figure with source citation, every function/type name you will reference. Verify against code. Mark unverifiable claims as uncertain.
4. **Generate HTML** with these sections:
   1. Executive summary (hero, 20-24px, intuition first then scope)
   2. KPI dashboard (files changed, lines added/removed, test coverage, housekeeping badges)
   3. Module architecture (Mermaid dependency graph with zoom controls)
   4. Feature comparisons (before/after side-by-side panels)
   5. Flow diagrams (lifecycle/pipeline)
   6. File map (color-coded tree, collapsible)
   7. Test coverage (before/after counts)
   8. Code review (Good/Bad/Ugly/Questions cards with border accents)
   9. Decision log (each choice with rationale, alternatives, confidence level)
   10. Re-entry context (invariants, coupling, gotchas — collapsible)
5. Write to `~/.agent/diagrams/diff-review-<slug>.html`
6. Open with `xdg-open ~/.agent/diagrams/<filename>.html`

**Visual standards:**
- Diff colors: red (removed), green (added), yellow (modified), blue (neutral)
- Hero depth for sections 1-3; flat/recessed for reference material
- Decision card borders: green (high confidence), blue (inferred), amber (low confidence)
- `min-width: 0` on all grid/flex children

Ultrathink.
