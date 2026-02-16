---
description: Verify a visual review HTML page against actual source code — correct inaccuracies in place
argument-hint: [path-to-file]
---

# Fact Check

Verify a document's factual claims against the actual codebase. Correct inaccuracies in place.

## Variables

TARGET_FILE: $ARGUMENTS

## Target Detection

- Explicit path → verify that file
- No argument → verify the most recently modified `.html` in `~/.agent/diagrams/` (`ls -t ~/.agent/diagrams/*.html | head -1`)

## Workflow

1. Load the visual-explainer skill (`Skill("visual-explainer")`). Read `~/Claude/skills/visual-explainer/references/css-patterns.md` to match existing page styling.
2. **Phase 1 — Extract claims**: read TARGET_FILE. Extract every verifiable factual claim:
   - **Quantitative**: line counts, file counts, function counts, any numeric metrics
   - **Naming**: function names, type names, module names, file paths referenced
   - **Behavioral**: what code does, how things work, before/after comparisons
   - **Structural**: architecture claims, dependency relationships, import chains
   - **Temporal**: git history claims, commit attributions, timeline entries
   - Skip subjective analysis (opinions, design judgments) — only verifiable facts
3. **Phase 2 — Verify against source**: for each claim, go to the source:
   - Re-read every file referenced — check signatures, behavior against actual code
   - For git history claims: re-run git commands and compare output
   - For diff-reviews: read both ref version (`git show <ref>:file`) and working tree
   - Classify each: **Confirmed** / **Corrected** (note what was wrong) / **Unverifiable**
4. **Phase 3 — Correct in place**: surgical edits to TARGET_FILE:
   - Fix incorrect numbers, names, paths, behavior descriptions
   - Fix before/after swaps (common error class)
   - For fundamentally wrong sections: rewrite content, preserve surrounding structure
   - For HTML: preserve layout, CSS, animations, Mermaid diagrams (unless they contain factual errors)
5. **Phase 4 — Add verification summary**:
   - HTML files: insert a verification banner (subtle card, muted colors, matching page style) at top or as final section
   - Include: total claims checked, confirmed count, list of corrections made (with file:line citations), unverifiable claims flagged
6. Open corrected file: `xdg-open <TARGET_FILE>`
7. Report what was checked, what was corrected.

This is a fact-checker, not a re-reviewer. It does not second-guess analysis or design judgments. It only verifies data matches reality.

Ultrathink.
