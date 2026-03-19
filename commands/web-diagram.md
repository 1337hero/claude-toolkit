---
description: Generate a beautiful standalone HTML diagram and open it in the browser
argument-hint: <topic or description>
---

# Web Diagram

Generate a self-contained HTML diagram for `$ARGUMENTS` and open it in the browser.

## Variables

TOPIC: $ARGUMENTS

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read references: `~/Claude/skills/visual-explainer/references/css-patterns.md` and `~/Claude/skills/visual-explainer/references/libraries.md`.
2. If no TOPIC is provided, stop and ask the user what to diagram.
3. Think strategically: what diagram type best represents this content? What aesthetic fits?
4. Generate a beautiful, self-contained HTML page following the visual-explainer skill workflow.
5. Choose a distinctive font pairing from libraries.md — not Inter/Roboto/system-ui.
6. Vary the palette from generic defaults — pick something intentional, avoid the anti-patterns.
7. Write to `~/.agent/diagrams/<descriptive-slug>.html`
8. Open with `xdg-open ~/.agent/diagrams/<filename>.html`
9. Report the file path.

Ultrathink before generating.
