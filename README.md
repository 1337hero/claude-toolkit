# Claude Code Configuration

My working setup for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Skills, agents, hooks, slash commands, output styles, and the `CLAUDE.md` that ties it all together.

This repo lives  `~/Claude` and it's folders are symlinked into  `~/.claude/` 

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
├── skills/                # 30 skills — from frontend design to SEO audits to PDF manipulation
├── output-styles/         # Response format presets (bullet points, zen master, ultra-concise)
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

### Skills (30)

Each skill is a self-contained capability Claude can invoke. Some I built, some are community skills I've adapted.

**Development:** `frontend-design`, `frontend-philosophy`, `scaffold-astro`, `mcp-builder`, `web-artifacts-builder`, `systematic-debugging`, `playwright-skill`

**Design:** `awwwards-design`, `mk3y-design`, `ui-ux-pro-max`, `canvas-design`, `visual-audit`, `visual-explainer`

**Writing & Marketing:** `copywriting`, `writing-clearly-and-concisely`, `doc-coauthoring`, `brand-identity`, `marketing-psychology`, `competitive-analysis`

**SEO:** `seo-audit`, `seo-competitor-analysis`, `programmatic-seo`

**Research:** `mckinsey-research`, `audit-website`

**Tooling:** `pdf`, `tmux`, `uv`, `commit`, `skill-creator`

### Agents (18)

Subagents for parallel and specialized work:

- **Code reviewers** — DHH-style, React/Preact masters, Rust, component analysis
- **Team** — builder, validator, Next.js expert, React/TypeScript specialist
- **Testers** — API frontend (curl-based), API backend (pytest), test writer
- **Research** — system architect, docs fetcher, PRD writer, YouTube API expert, LLM/AI research
- **Utilities** — meta-agent (creates new agents), training data generator, work completion summary, Hono stack scaffolder

### Hooks

Python scripts (using `uv` inline dependencies) that fire on Claude Code lifecycle events:

- **Session start/end** — load context, log sessions
- **Notifications** — audio alerts when Claude needs input
- **Validators** — ruff linter runs automatically after Python file writes
- **Subagent sounds** — different audio cues for different agent types starting/stopping
- **TTS utilities** — ElevenLabs, OpenAI, Piper, pyttsx3, Qwen text-to-speech

### Slash Commands (20)

Custom commands beyond the built-ins:

`/remember` `/resume` `/plan` `/build` `/prime` `/diff-review` `/fact-check` `/plan-review` `/project-recap` `/web-diagram` `/question` `/memories` `/save-thread` `/sentient` `/reconnect` and more.

### Output Styles

Swap Claude's response format on the fly: `bullet-points`, `ultra-concise`, `table-based`, `yaml-structured`, `markdown-focused`, `zen-master`, `tts-summary`, `genui`.

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

## Plugins I Use (Not Committed)

Plugins are installed via Claude Code's plugin system (`/install-plugin`) and live in `~/.claude/plugins/`. You'll see references to these throughout the skills list — they're not in this repo, but they're part of the workflow.

**[Superpowers](https://github.com/anthropics/claude-plugins-official)** — The big one. Adds structured workflows for brainstorming, plan writing, TDD, parallel agent dispatch, code review, debugging, and git worktree management. If you only install one plugin, make it this.

**[Ralph Loop](https://github.com/anthropics/claude-plugins-official)** — Autonomous loop that lets Claude keep working without waiting for input at each step. Useful for executing multi-step plans.

**[Trail of Bits Security](https://github.com/trailofbits/skills)** — Two plugins:
- `insecure-defaults` — flags insecure patterns in generated code
- `ask-questions-if-underspecified` — forces Claude to clarify before guessing

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
