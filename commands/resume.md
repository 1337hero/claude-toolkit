# Resume Project

Help me pick up where I left off on a project.

## Instructions

1. **Check for memory files** - Look in `~/Claude/memories/` for files matching the current project or the project name I specify
2. **Read the most recent relevant memory** - Find the latest session snapshot
3. **Summarize the context** - Remind me what we were doing
4. **Suggest next steps** - Based on the "Next Steps" section, propose what to tackle

## Your Response Should Include

1. **Quick Recap** - 2-3 sentences on what this project is and where we left off
2. **Last Session Summary** - Key points from the memory file
3. **Pending Items** - Any unchecked TODOs or next steps
4. **Suggested Starting Point** - "I'd suggest we start by..."

## If No Memory Found

If there's no memory file for this project:
1. Check if there's a project file in `~/Claude/projects/`
2. Look for `CLAUDE.md` or `README.md` in the current directory
3. Offer to explore the codebase to build context

## Arguments

If I specify a project name after the command (e.g., `/resume faster-chat`), search for that specifically. Otherwise, infer from the current working directory.
