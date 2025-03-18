# List Memories

Show me what's stored in my memories folder.

## Instructions

1. List all files in `~/Claude/memories/`
2. Group by project if possible (based on filename prefix)
3. Show the date and a one-line summary from each file
4. Highlight any with pending TODOs or next steps

## Output Format

```
## Your Memories

### {Project Name}
- {date}: {one-line summary} [X pending items]

### {Another Project}
- {date}: {one-line summary}
```

If the folder is empty, let me know and suggest using `/remember` to create the first one.
