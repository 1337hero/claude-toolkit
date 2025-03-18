# Remember This Session

Analyze our conversation and create a memory snapshot for future reference.

## Instructions

1. **Identify the project** - What project/topic were we working on?
2. **Summarize what was accomplished** - Key changes, files modified, decisions made
3. **Capture important context** - Technical decisions, user preferences expressed, gotchas discovered
4. **Note where we left off** - Current state, any blockers, immediate next steps
5. **Extract action items** - Anything explicitly mentioned as TODO or planned

## Output Format

Create a markdown file in `~/Claude/memories/` with this structure:

**Filename**: `{project-name}-{date}.md` (e.g., `faster-chat-2024-11-24.md`)

**Content**:
```markdown
# {Project Name} - Session {Date}

## Summary
{2-3 sentence overview of what was accomplished}

## What We Did
- {Bullet points of key accomplishments}

## Key Decisions
- {Technical choices made and why}

## Current State
{Where the project stands now - what's working, what's not}

## Next Steps
- [ ] {Actionable items to pick up from}

## Context to Remember
{Any preferences, constraints, or gotchas to keep in mind}

## Files Touched
- `{path/to/file}` - {what changed}
```

## Important

- Be concise but capture enough context to resume cold
- Focus on the "why" not just the "what"
- Include specific file paths and function names when relevant
- If there's an existing memory file for this project, consider whether to append or create new

Write the file now, then confirm what was saved.
