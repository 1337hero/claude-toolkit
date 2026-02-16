---
description: Generate a beautiful standalone HTML diagram and open it in the browser
argument-hint: <topic or description>
---

# Web Diagram

Generate a self-contained HTML diagram for `$ARGUMENTS` and open it in the browser.

## Variables

TOPIC: $ARGUMENTS

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read `~/Claude/skills/visual-explainer/references/css-patterns.md` for design patterns.
2. If no TOPIC is provided, stop and ask the user what to diagram.
3. Think strategically: what diagram type best represents this content? What aesthetic fits?
4. Generate a beautiful, self-contained HTML page following the visual-explainer skill workflow.
5. Choose a distinctive font (not Inter/Roboto/system-ui) — use Google Fonts CDN.
6. Vary the palette from generic defaults — pick something intentional.
7. Write to `~/.agent/diagrams/<descriptive-slug>.html`
8. Open with `xdg-open ~/.agent/diagrams/<filename>.html`
9. Report the file path.

Ultrathink before generating.
