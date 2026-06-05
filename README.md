# Claude Code Configuration

My working setup for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — skills, agents, hooks, slash commands, output styles, and the `CLAUDE.md` that drives it.

Take what's useful, ignore the rest.

## Quickstart

The repo lives at `~/Claude` and symlinks into `~/.claude/`:

```bash
git clone <your-fork> ~/Claude
ln -s ~/Claude/CLAUDE.md      ~/.claude/CLAUDE.md
ln -s ~/Claude/agents         ~/.claude/agents
ln -s ~/Claude/commands       ~/.claude/commands
ln -s ~/Claude/hooks          ~/.claude/hooks
ln -s ~/Claude/skills         ~/.claude/skills
ln -s ~/Claude/output-styles  ~/.claude/output-styles
```

Then create your own `MEMORY.md`, `settings.json`, and the `todos/`, `memories/`, `projects/` directories. They're gitignored — that's where your real context lives.

## Reference

### Skills

Coding work:

- **[browser-tools](./skills/browser-tools/SKILL.md)** — Browser automation via Chrome DevTools.
- **[codebase-documenter](./skills/codebase-documenter/SKILL.md)** — Write READMEs, architecture docs, and code comments.
- **[commit](./skills/commit/SKILL.md)** — Conventional-commit workflow; read before committing.
- **[frontend-design](./skills/frontend-design/SKILL.md)** — Distinctive frontend interfaces; no generic AI aesthetics.
- **[frontend-philosophy](./skills/frontend-philosophy/SKILL.md)** — React/Preact conventions: TanStack Query, no TypeScript, no barrel files.
- **[handoff](./skills/handoff/SKILL.md)** — Compact current work into a document for another agent.
- **[improve-codebase-architecture](./skills/improve-codebase-architecture/SKILL.md)** — Consolidate modules, improve testability and AI navigation.
- **[insecure-defaults](./skills/insecure-defaults/SKILL.md)** — Catch hardcoded secrets, weak auth, permissive config.
- **[prototype](./skills/prototype/SKILL.md)** — Build a throwaway prototype to flesh out a design.
- **[quality-code](./skills/quality-code/SKILL.md)** — Type-safe, well-tested, observable TypeScript.
- **[requesting-code-review](./skills/requesting-code-review/SKILL.md)** — Verify work meets requirements before merging.
- **[scaffold-astro](./skills/scaffold-astro/SKILL.md)** — Scaffold Astro projects with Bun + Tailwind.
- **[skill-creator](./skills/skill-creator/SKILL.md)** — Create or update skills.
- **[systematic-debugging](./skills/systematic-debugging/SKILL.md)** — Root-cause-first discipline for hard bugs.
- **[test-driven-development](./skills/test-driven-development/SKILL.md)** — Red-green-refactor loop.
- **[to-issues](./skills/to-issues/SKILL.md)** — Break a plan into tracer-bullet issues.
- **[to-prd](./skills/to-prd/SKILL.md)** — Turn a conversation into a PRD and publish it.
- **[triage](./skills/triage/SKILL.md)** — Triage incoming issues through a state machine.
- **[using-git-worktrees](./skills/using-git-worktrees/SKILL.md)** — Isolated worktrees for feature work.
- **[visual-audit](./skills/visual-audit/SKILL.md)** — Screenshot and analyze visual composition.

Writing and communication:

- **[caveman](./skills/caveman/SKILL.md)** — Ultra-compressed output mode; cuts tokens ~75%.
- **[compress](./skills/compress/SKILL.md)** — Compress memory files (CLAUDE.md, todos) to caveman format.
- **[writing-clearly-and-concisely](./skills/writing-clearly-and-concisely/SKILL.md)** — Strunk's writing rules for docs, commits, errors, UI copy.

Integrations:

- **[bird](./skills/bird/SKILL.md)** — Twitter/X via the `bird` CLI.
- **[cloudflare](./skills/cloudflare/SKILL.md)** — Cloudflare API: DNS, Workers, Tunnels, zones.
- **[gccli](./skills/gccli/SKILL.md)** — Google Calendar CLI.
- **[gdcli](./skills/gdcli/SKILL.md)** — Google Drive CLI.
- **[hetzner-cloud](./skills/hetzner-cloud/SKILL.md)** — Hetzner Cloud infrastructure via `hcloud`.
- **[jarvislabs](./skills/jarvislabs/SKILL.md)** — GPU experiments on JarvisLabs.ai.
- **[localmaxxing](./skills/localmaxxing/SKILL.md)** — Local-LLM benchmark and eval leaderboards.

### Agents

- **[dhh-code-reviewer](./agents/code-reviewers/dhh-code-reviewer.md)** — JavaScript/TypeScript review in DHH's style.
- **[go-reviewer](./agents/code-reviewers/go-reviewer.md)** — Idiomatic Go review against Effective Go.
- **[react-masters-reviewer](./agents/code-reviewers/react-masters-reviewer.md)** — React/Preact review through Linsley, Florence, Dodds, Pocock, Abramov, Browne.
- **[builder](./agents/team/builder.md)** — Executes one engineering task at a time.
- **[validator](./agents/team/validator.md)** — Read-only verification that a task met its acceptance criteria.
- **[api-frontend-tester](./agents/testers/api-frontend-tester.md)** — Systematic API testing with curl.
- **[api-backend-tester](./agents/testers/api-backend-tester.md)** — Backend testing with pytest and Python tooling.
- **[test-coverage](./agents/testers/test-coverage.md)** — Add tests retroactively to existing untested code.
- **[docs-fetcher](./agents/docs-fetcher.md)** — Pull current API references and gotchas before implementing.

### Slash Commands

- **`/plan`** — Write an engineering plan to `specs/`.
- **`/plan_w_team`** — Same, with a multi-agent team pass.
- **`/build`** — Implement the plan.
- **`/pickup`** — Pick up where you left off last session.
- **`/remember`** — Capture this session's outcome to memory.
- **`/question`** — Answer questions about the project without writing code.
- **`/generate-visual-plan`** — Render a feature plan as a visual.

### Hooks

Python scripts (run via `uv` inline deps) wired to Claude Code lifecycle events:

- **Session start/end** — load context, log sessions.
- **Notifications** — audio cues when Claude needs input.
- **Validators** — ruff runs after every Python write.
- **Subagent sounds** — distinct cues per agent type.
- **TTS** — ElevenLabs, OpenAI, Piper, pyttsx3, Qwen.

### Output Styles

Swap response format on the fly: `genui`, `markdown-focused`, `table-based`, `ultra-concise`.

## What's Gitignored

| Path | Why |
|------|-----|
| `MEMORY.md` | Persistent context, preferences, active state |
| `settings.json` | Customize your own |
| `*.local.json` | Machine-specific overrides |
| `memories/` | Session snapshots |
| `projects/` | Living docs for active work |
| `todos/` | Task tracking |
| `.env` | API keys |
| `logs/`, `status_lines/` | Runtime ephemera |

## Dependencies

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [uv](https://github.com/astral-sh/uv) — hooks run via `uv run --script`
- [PipeWire](https://pipewire.org/) — `pw-play` for notification sounds on Linux
- [ruff](https://github.com/astral-sh/ruff) — Python validator, auto-installed via `uvx`

## License

[WTFPL](LICENSE)
