# Pick Up Where I Left Off

Resume work on a project using saved memory snapshots.

## Instructions

1. **Find memories** — List files in `~/Claude/memories/` matching the current project or the project name specified as argument
2. **If no argument given** — Infer project from current working directory name
3. **Read the most recent match** — Load the latest session snapshot
4. **Summarize** — Quick recap, key decisions, current state
5. **Surface next steps** — From the "Next Steps" section, propose what to tackle
6. **If no match found** — Check for `CLAUDE.md` or `README.md` in cwd, offer to explore and build context

## Your Response Should Include

1. **Quick Recap** — 2-3 sentences: what this project is, where we left off
2. **Last Session Summary** — Key decisions, gotchas, state
3. **Pending Items** — Unchecked TODOs or next steps from the memory file
4. **Suggested Starting Point** — "I'd suggest we start by..."

## Arguments

`/pickup [project-name]` — search for that name in memory filenames. Otherwise infer from cwd.
