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

Then create your own `MEMORY.md`, `settings.json`, and the `todos/`, `memories/`, `projects/`, `docs/` directories. They're gitignored — that's where your real context lives.

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
- **[playwright-skill](./skills/playwright-skill/SKILL.md)** — Browser automation with Playwright; auto-detects dev servers.
- **[ponytail](./skills/ponytail/SKILL.md)** — Forces the laziest solution that works: YAGNI, stdlib before deps.
- **[ponytail-audit](./skills/ponytail-audit/SKILL.md)** — Whole-repo audit for over-engineering; ranked delete/simplify list.
- **[ponytail-review](./skills/ponytail-review/SKILL.md)** — Diff review that hunts over-engineering only.
- **[prototype](./skills/prototype/SKILL.md)** — Build a throwaway prototype to flesh out a design.
- **[quality-code](./skills/quality-code/SKILL.md)** — Type-safe, well-tested, observable TypeScript.
- **[systematic-debugging](./skills/systematic-debugging/SKILL.md)** — Root-cause-first discipline for hard bugs.
- **[test-driven-development](./skills/test-driven-development/SKILL.md)** — Red-green-refactor loop.
- **[thermo-nuclear-code-quality-review](./skills/thermo-nuclear-code-quality-review/SKILL.md)** — Extremely strict maintainability review.
- **[using-git-worktrees](./skills/using-git-worktrees/SKILL.md)** — Isolated worktrees for feature work.
- **[visual-audit](./skills/visual-audit/SKILL.md)** — Screenshot and analyze visual composition.

Writing and communication:

- **[caveman](./skills/caveman/SKILL.md)** — Ultra-compressed output mode; cuts tokens ~75%.
- **[writing-clearly-and-concisely](./skills/writing-clearly-and-concisely/SKILL.md)** — Strunk's writing rules for docs, commits, errors, UI copy.

Integrations:

- **[bird](./skills/bird/SKILL.md)** — Twitter/X via the `bird` CLI.
- **[cloudflare](./skills/cloudflare/SKILL.md)** — Cloudflare API: DNS, Workers, Tunnels, zones.
- **[jarvislabs](./skills/jarvislabs/SKILL.md)** — GPU experiments on JarvisLabs.ai.
- **[llama-tune](./skills/llama-tune/SKILL.md)** — Empirically tune GGUF models on a multi-GPU rig (llama.cpp/llama-swap).
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
- **`/question`** — Answer questions about the project without writing code.

### Workflows

Deterministic multi-agent orchestration scripts, run via the `Workflow` tool:

- **[code-quality-enforcer](./workflows/code-quality-enforcer.js)** — DHH craft + six React masters + house rules, every finding adversarially verified.

### Hooks

Shell/Go scripts wired to Claude Code lifecycle events:

- **Session start/end, PreCompact, Stop** — load context, log sessions, compact handoffs.
- **Notifications** — audio cues when Claude needs input.
- **Validators** (`hooks/validators/`) — ruff and ty run after every Python write; custom file-contents checks.
- **Subagent sounds** (`hooks/sounds/agents/`) — distinct start/stop cues per agent type.
- **PermissionRequest** — Go binary gating tool calls.

### Output Styles

- **[genui](./output-styles/genui.md)** — Generative UI with embedded modern styling.

### Scripts

- **[committer.sh](./scripts/committer.sh)** — Scripted commit helper.
- **[visual-audit](./scripts/visual-audit/)** — Go CLI backing the `visual-audit` skill.

### Status Line

- **[statusline-command.sh](./statusline/statusline-command.sh)** — Custom status line, wired via `settings.json`.

## What's Gitignored

| Path | Why |
|------|-----|
| `MEMORY.md` | Persistent context, preferences, active state |
| `settings.json` | Customize your own |
| `*.local.json` | Machine-specific overrides |
| `memories/` | Session snapshots |
| `projects/` | Living docs for active work |
| `todos/` | Task tracking |
| `docs/` | Scratch/plan docs, same treatment as `projects/` |
| `.env` | API keys |
| `logs/`, `status_lines/` | Runtime ephemera |

## Dependencies

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [uv](https://github.com/astral-sh/uv) — hooks run via `uv run --script`
- [PipeWire](https://pipewire.org/) — `pw-play` for notification sounds on Linux
- [ruff](https://github.com/astral-sh/ruff) — Python validator, auto-installed via `uvx`

## License

[WTFPL](LICENSE)
