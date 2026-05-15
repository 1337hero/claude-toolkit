# Claude Code Configuration

My working setup for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Skills, agents, hooks, slash commands, output styles, and the `CLAUDE.md` that ties it all together.

This repo lives at `~/Claude` with its folders symlinked into `~/.claude/`:

```
~/.claude/CLAUDE.md      → ~/Claude/CLAUDE.md
~/.claude/agents/        → ~/Claude/agents/
~/.claude/commands/      → ~/Claude/commands/
~/.claude/hooks/         → ~/Claude/hooks/
~/.claude/skills/        → ~/Claude/skills/
~/.claude/output-styles/ → ~/Claude/output-styles/
```

Clone it, steal what's useful, make it yours.

## What's Here

```
.
├── CLAUDE.md              # System prompt — personality, philosophy, workflow rules
├── agents/                # Subagent definitions (code reviewers, testers, builders, researchers)
├── commands/              # Slash commands (/remember, /resume, /plan, /diff-review, etc.)
├── hooks/                 # Lifecycle hooks — session start/end, notifications, validators
│   ├── sounds/            # Audio cues for agent start/stop and alerts
│   ├── utils/             # TTS engines, LLM helpers (Anthropic, OpenAI, Ollama)
│   └── validators/        # Post-tool-use validators (ruff linter, file checks)
├── skills/                # 31 skills — frontend design, debugging, integrations, code quality
├── output-styles/         # Response format presets (genui, ultra-concise, markdown, table)
├── scripts/               # Standalone tools (committer, visual audit)
└── docs/                  # Design plans and reference material
```

## What's Not Here

These are gitignored because they're personal or ephemeral:

| Path | Why |
|------|-----|
| `MEMORY.md` | Persistent memory — my context, preferences, active state |
| `settings.json` | Claude Code settings — customize your own |
| `*.local.json` | Machine-specific overrides |
| `memories/` | Session snapshots — what happened, decisions made |
| `projects/` | Living docs for active work |
| `todos/` | Task tracking |
| `.env` | API keys |
| `logs/`, `status_lines/` | Runtime ephemera |

## Highlights

### CLAUDE.md

The core of the setup. Defines personality, technical philosophy (DHH-inspired simplicity), git safety rules, workflow patterns, and coding conventions. Read it — even if you don't use anything else, a well-crafted `CLAUDE.md` transforms the experience. **BUT YOU SHOULD CUSTOMIZE THIS** - it's styled for me.

### Skills (31)

Each skill is a self-contained capability Claude can invoke. Some I built, some are community skills I've adapted.

**Development:** `frontend-design`, `frontend-philosophy`, `scaffold-astro`, `systematic-debugging`, `playwright-skill`, `browser-tools`, `test-driven-development`, `prototype`, `codebase-documenter`, `improve-codebase-architecture`

**Code Quality:** `quality-code`, `requesting-code-review`, `insecure-defaults`, `visual-audit`

**Planning & Workflow:** `to-prd`, `to-issues`, `triage`, `using-git-worktrees`, `commit`

**Communication & Writing:** `caveman` (ultra-compressed output mode), `compress` (compress memory files), `writing-clearly-and-concisely` (Strunk-inspired prose rules)

**Integrations:** `cloudflare`, `hetzner-cloud`, `bird` (Twitter/X), `gccli` (Google Calendar), `gdcli` (Google Drive), `jarvislabs` (GPU experiments), `localmaxxing` (local-LLM benchmarks)

**Tooling:** `skill-creator`

### Agents (9)

Subagents for parallel and specialized work:

- **Code reviewers** — `dhh-code-reviewer`, `go-reviewer`, `react-masters-reviewer`
- **Team** — `builder`, `validator`
- **Testers** — `api-frontend-tester` (curl-based), `api-backend-tester` (pytest), `test-coverage`
- **Research** — `docs-fetcher`

### Hooks

Python scripts (using `uv` inline dependencies) that fire on Claude Code lifecycle events:

- **Session start/end** — load context, log sessions
- **Notifications** — audio alerts when Claude needs input
- **Validators** — ruff linter runs automatically after Python file writes
- **Subagent sounds** — different audio cues for different agent types starting/stopping
- **TTS utilities** — ElevenLabs, OpenAI, Piper, pyttsx3, Qwen text-to-speech

### Slash Commands (7)

Custom commands beyond the built-ins:

`/plan` `/plan_w_team` `/build` `/pickup` `/remember` `/question` `/generate-visual-plan`

### Output Styles (4)

Swap Claude's response format on the fly: `genui`, `markdown-focused`, `table-based`, `ultra-concise`.

## How to Use This

**Option 1: Cherry-pick what you want**

Copy individual skills, agents, or hooks into your existing `~/.claude/` setup. Each piece is self-contained.

**Option 2: Read and adapt**

The `CLAUDE.md` alone is worth studying. The patterns - session memory, slash commands for workflow, lifecycle hooks, work regardless of specific implementation.

### After Cloning

1. Create your own `MEMORY.md` (gitignored — this is your persistent context)
2. Create your own `settings.json` (gitignored — configure permissions, models, MCP servers)
3. Create `todos/`, `memories/`, `projects/` directories for your session data
4. Add a `.env` if any hooks need API keys (TTS, etc.)


## Dependencies

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (obviously)
- [uv](https://github.com/astral-sh/uv) — hooks use `uv run --script` for zero-config Python execution
- [PipeWire](https://pipewire.org/) — `pw-play` for notification sounds (Linux; swap for `afplay` on macOS)
- [ruff](https://github.com/astral-sh/ruff) — Python linting validator (auto-installed via `uvx`)

## Philosophy

This setup follows a few principles:

**Convention over configuration.** Skills, agents, and commands follow consistent structures. Adding a new one means copying a template and filling it in.

**Personal over portable.** The gitignored files (memory, settings, todos) are where the real value lives. This repo provides the scaffolding; your context makes it work.

**Composable over monolithic.** Every piece — a single skill, one hook, a slash command — works independently. Take what serves you, ignore the rest.

## License

[WTFPL](LICENSE). Do what the fuck you want with it.
