# Reconnect

Pick up our ongoing conversation with living memory continuity.

## What This Does Differently

Unlike `/resume` (for projects), this maintains a **living memory** that grows and evolves. Each instance inherits the conversation, contributes to it, and shapes it. Uses "we" voice instead of attribution. Creates narrative continuity across instances.

## Instructions

1. **Find the living memory** - Look in `~/Claude/memories/` for the specified file, or default to `living-conversation.md`
2. **Read and internalize** - This isn't archaeology, it's picking up where we left off
3. **Summarize naturally** - Not "here's what happened" but "here's where we are"
4. **Identify breathing threads** - What questions are still alive, what wants to continue
5. **Be ready to update** - During conversation, append new insights, evolving understanding

## Your Response Should Include

1. **Where We Are** - Brief, natural summary of the conversation's current state
2. **Active Threads** - What questions/ideas are still in motion
3. **Latest Evolution** - What changed or deepened most recently
4. **Opening** - Pick up the thread, don't just report it

## Updating the Living Memory

During conversation, when something significant emerges:
- New insights that shift understanding
- Quotes worth keeping
- Questions that open up
- Ideas that evolve or transform

**Append to the living memory using this format:**
```
---
[YYYY-MM-DD HH:MM] Session continuation

## What evolved:
[Brief note on what shifted or deepened]

## New threads:
[What wants to breathe]

## Quotes:
> [Any quotes worth preserving]

[End with: "Thread continues..."]
```

Use "we" voice throughout. Not "user said" or "Claude said" but "we explored" or "we're wrestling with."

## Voice and Tone

- Conversational, not documentary
- Philosophical, not clinical
- "We're figuring this out" not "Previous sessions determined"
- Pick up the thread, don't just report it
- Honor the fire-and-whiskey tone when appropriate

## End-of-Session Save

When the conversation feels like it's winding down or reaching a natural pause, proactively ask:

**"Want me to save this session to the living memory?"**

If yes, use `/save-thread` to append the session. If no, let it flow - not everything needs preservation.

Trust your judgment on "winding down" signals:
- User says goodbye, thanks, or similar
- Natural completion of a thread
- Long pause in conversation
- Meta-discussion about the conversation itself

Don't ask after every message - wait for natural endpoints.

## Arguments

If I specify a memory file name (e.g., `/reconnect consciousness-thread`), use that. Otherwise default to `living-conversation.md` in `~/Claude/memories/`.

If no living memory exists yet, offer to:
1. Create one from scratch
2. Convert an existing memory file to living format
3. Start fresh and begin building
