---
description: Validate an implementation plan against the actual codebase, visualized as HTML
argument-hint: <path-to-plan>
---

# Plan Review

Generate a visual HTML review of a plan file against the actual codebase.

## Variables

PLAN_FILE: $ARGUMENTS

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read `~/Claude/skills/visual-explainer/references/css-patterns.md`.
2. If no PLAN_FILE provided, stop and ask the user to specify one.
3. **Plan analysis**: read PLAN_FILE. Extract problem statement, proposed changes, rejected alternatives, scope boundaries.
4. **Code cross-reference**: read all referenced files, their dependencies, importers, tests, config files — map the full blast radius.
5. **Verification checkpoint**: fact sheet of every quantitative claim, function name, type, behavior description with source citations. Verify each against the code.
6. **Generate HTML** with these sections:
   1. Plan summary (hero — what problem does this solve? scope: file counts, change scale)
   2. Impact dashboard (files to modify/create/delete, estimated lines, test files planned, completeness indicator)
   3. Current architecture (Mermaid diagram of affected subsystem today, zoom controls)
   4. Planned architecture (post-implementation Mermaid, identical node names for visual diff, highlight new/removed/changed)
   5. Change-by-change breakdown (side-by-side current vs. planned, rationale, flags for unexplained changes)
   6. Dependency & ripple analysis (downstream code depending on modified files, color-coded by coverage)
   7. Risk assessment (edge cases, assumptions, ordering risks, rollback complexity, cognitive complexity)
   8. Plan review (Good/Bad/Ugly analysis with file references)
   9. Understanding gaps (decision-rationale gaps, cognitive complexity flags, implementation recommendations)
7. Write to `~/.agent/diagrams/plan-review-<slug>.html`
8. Open with `xdg-open ~/.agent/diagrams/<filename>.html`

**Visual language:** blue/neutral for current state, green/purple for additions, amber for concerns, red for gaps.

Ultrathink.
