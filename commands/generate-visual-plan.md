---
description: Generate a visual implementation plan for a feature
argument-hint: <feature description>
---

# Generate Visual Plan

Generate a visual implementation plan for `$ARGUMENTS` and open it in the browser.

## Variables

FEATURE: $ARGUMENTS

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read references: `~/Claude/skills/visual-explainer/references/css-patterns.md` and `~/Claude/skills/visual-explainer/references/libraries.md`.
2. If no FEATURE provided, stop and ask the user what to plan.
3. **Analyze the codebase**: read relevant files, understand the current architecture, identify the blast radius.
4. **Plan the implementation**: break into phases/steps, identify files to create/modify, key decisions.
5. **Generate HTML** with these sections:
   - Overview/purpose (hero — what problem does this solve?)
   - Flow diagram (Mermaid or CSS cards showing the implementation flow)
   - File structure with descriptions (not full code)
   - Key implementation details (snippets of core logic only)
   - API/interface summary (if applicable)
   - Phase breakdown (numbered cards or timeline)
   - Risk assessment (callout boxes for gotchas)
6. Don't dump full files — show structure with one-line descriptions per function/export.
7. Use distinctive fonts and a non-default palette.
8. Write to `~/.agent/diagrams/plan-<descriptive-slug>.html`
9. Open with `xdg-open ~/.agent/diagrams/<filename>.html`
10. Report the file path.

Ultrathink before generating.
