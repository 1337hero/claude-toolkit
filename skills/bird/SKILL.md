---
name: bird
description: "Read and post to Twitter/X using the `bird` CLI. Full surface: tweets, threads, search, timelines, bookmarks, likes, follows, lists, trending, media. Handles Firefox cookie extraction."
---

## Auth: Extract Firefox Cookies

bird needs `auth_token` and `ct0` from Firefox. node:sqlite is broken on this system, so extract manually before every bird session:

```bash
cp /home/mikekey/.mozilla/firefox/u80t1430.default-release/cookies.sqlite /tmp/ff_cookies.sqlite
sqlite3 /tmp/ff_cookies.sqlite "SELECT name, value FROM moz_cookies WHERE (host LIKE '%twitter.com%' OR host LIKE '%x.com%') AND name IN ('auth_token', 'ct0');"
```

Capture both values, then pass to every bird command:

```bash
bird <command> --auth-token <auth_token> --ct0 <ct0> --plain ...
```

Always use `--plain` (no emoji, no color — stable for LLM parsing). Use `--json` when structured data is needed. `bird check` verifies credentials without making other calls.

## Commands

### Read / discover

```bash
bird read <id-or-url>              # single tweet (shortcut: bird <id-or-url>)
bird thread <id-or-url>            # full conversation thread
bird replies <id-or-url>           # replies (--all, --max-pages N)
bird search "query"                # tweet search
bird mentions                      # tweets mentioning current user (or --user <handle>)
bird home                          # "For You" timeline
bird user-tweets <handle>          # profile timeline
bird list-timeline <id-or-url>     # tweets from a list
bird lists                         # your lists
bird news                          # AI-curated news from Explore (alias: trending)
bird bookmarks                     # your bookmarks
bird likes                         # your liked tweets
```

### Write / act

```bash
bird tweet "text"                  # post a tweet
bird reply <id-or-url> "text"      # reply to a tweet
bird unbookmark <id-or-url>...     # remove bookmarks (variadic)
bird follow <username-or-id>       # follow
bird unfollow <username-or-id>     # unfollow
```

### Social graph

```bash
bird following [handle]            # users followed by current user (or handle)
bird followers [handle]            # followers of current user (or handle)
bird about <username>              # account origin + location info
bird whoami                        # verify which account the cookies belong to
```

### Media attachments (global flags on tweet/reply)

```bash
--media <path>                     # repeatable, up to 4 images or 1 video
--alt "text"                       # alt text, repeated per media in order
```

Example:
```bash
bird tweet "caption" --media ./a.png --alt "a description" --media ./b.png --alt "b description"
```

### Auth / infrastructure

```bash
bird check                         # verify credentials
bird query-ids                     # show/refresh cached GraphQL query IDs (--json)
```

## Output flags

- `--plain` — stable, no emoji, no color. **Default for LLM use.**
- `--json` — structured output. Works on: read, replies, thread, search, mentions, bookmarks, likes, following, followers, about, lists, list-timeline, user-tweets, query-ids
- `--json-full` — adds raw API response in `_raw` field (tweet/reply only)
- `--no-emoji`, `--no-color` — individual overrides
- `--quote-depth <N>` — max quoted-tweet depth (default 1, 0 disables)
- `--timeout <ms>` — request timeout

## Workflow

1. Extract cookies (see Auth section)
2. Store `auth_token` and `ct0` in shell variables
3. Run bird commands with `--plain --auth-token "$AUTH_TOKEN" --ct0 "$CT0"`
4. On auth errors, re-extract from Firefox — cookies expire

## Config files

bird reads `~/.config/bird/config.json5` and `./.birdrc.json5` (JSON5 format).
Supports: `chromeProfile`, `chromeProfileDir`, `firefoxProfile`, `cookieSource`, `cookieTimeoutMs`, `timeoutMs`, `quoteDepth`.

Env vars: `NO_COLOR`, `BIRD_TIMEOUT_MS`, `BIRD_COOKIE_TIMEOUT_MS`, `BIRD_QUOTE_DEPTH`.

## Notes

- Binary: `/home/mikekey/.bun/bin/bird` (v0.8.0)
- Uses Twitter/X GraphQL API under the hood
- No DM support as of v0.8.0
- Firefox must have an active Twitter/X session for cookies to be valid
