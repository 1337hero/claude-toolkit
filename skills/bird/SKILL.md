---
name: bird
description: "Read and post to Twitter/X using the `bird` CLI. Handles Firefox cookie extraction, tweet reading, posting, search, and threads."
---

## Auth: Extract Firefox Cookies

bird needs `auth_token` and `ct0` from Firefox. node:sqlite is broken on this system, so extract manually before every bird session:

```bash
cp /home/mikekey/.mozilla/firefox/u80t1430.default-release/cookies.sqlite /tmp/ff_cookies.sqlite
sqlite3 /tmp/ff_cookies.sqlite "SELECT name, value FROM moz_cookies WHERE (host LIKE '%twitter.com%' OR host LIKE '%x.com%') AND name IN ('auth_token', 'ct0');"
rm /tmp/ff_cookies.sqlite
```

Capture both values, then pass to every bird command:

```bash
bird <command> --auth-token <auth_token> --ct0 <ct0> --plain ...
```

Always use `--plain` (no emoji, no color -- stable for LLM parsing). Use `--json` when structured data is needed.

## Commands

```bash
bird read <tweet-url>              # fetch a single tweet
bird thread <tweet-url>            # full thread
bird replies <tweet-url>           # list replies (--all, --max-pages N)
bird tweet "text"                  # post a tweet
bird reply <tweet-url> "text"      # reply to a tweet
bird search "query"                # search tweets
```

## Workflow

1. Extract cookies (see above)
2. Store `auth_token` and `ct0` in shell variables
3. Run bird commands with `--plain --auth-token "$AUTH_TOKEN" --ct0 "$CT0"`
4. Clean up `/tmp/ff_cookies.sqlite` after extraction

## Notes

- Binary: `/home/mikekey/.bun/bin/bird` (v0.8.0)
- Uses Twitter/X GraphQL API under the hood
- Cookies expire; if bird returns auth errors, re-extract from Firefox
- Firefox must have an active Twitter/X session for cookies to be valid
