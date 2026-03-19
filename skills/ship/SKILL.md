---
name: ship
description: |
  Ship workflow: merge base branch, run tests, review diff, optional version bump, commit, push, create PR.
  Use when asked to "ship", "deploy", "push", "create a PR", or "merge and push".
  Proactively suggest when the user says code is ready or asks about shipping.
---

## When to Use

- User says "ship", "ship it", "create a PR", "push this", "let's deploy"
- User indicates code is ready/done
- After `/build` completes and tests pass

## Workflow

### Step 0: Pre-flight

1. Detect the base branch:
   - Check if a PR already exists: `gh pr view --json baseRefName -q .baseRefName`
   - If no PR: `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`
   - Fallback: `main`
2. Check current branch — if on main/master, abort: "Ship from a feature branch."
3. `git status` (never `-uall`) — uncommitted changes are always included
4. Show what's shipping:
   - `git diff <base>...HEAD --stat`
   - `git log <base>..HEAD --oneline`
   - Count: files changed, insertions, deletions
5. Print a one-line summary: "Shipping `<branch>` → `<base>`: N commits, M files changed"

### Step 1: Merge Base Branch

Fetch and merge base branch so tests run against merged state:

```bash
git fetch origin <base> && git merge origin/<base> --no-edit
```

- If merge conflicts: attempt auto-resolve for simple cases (lockfiles, formatting). If complex, **STOP** and show conflicts.
- If already up to date: continue silently.

### Step 2: Run Tests

Auto-detect and run the project's test suite. Check in order:

| Detection | Command | Framework |
|-----------|---------|-----------|
| `vitest.config.*` or `"vitest"` in package.json | `bun run test:run` or `bun run test:ci` or `bunx vitest run` | Vitest |
| `cypress.config.*` | `npx cypress run` | Cypress |
| `jest.config.*` or `"jest"` in package.json | `bun run test` or `npx jest` | Jest |
| `playwright.config.*` | `npx playwright test` | Playwright |
| `go.mod` | `go test ./...` | Go stdlib |
| `Cargo.toml` | `cargo test` | Rust |
| `pytest.ini` or `pyproject.toml` with pytest | `pytest` | Python |

**If test script exists in package.json** (`test`, `test:run`, `test:ci`), prefer that over direct invocation.

**If no test framework detected:** Note "No test framework detected — skipping tests." Continue (don't block).

**If tests fail: STOP.** Show failures. Do not proceed.

**If tests pass:** Note pass count briefly. Continue.

### Step 3: Diff Review

Lightweight pre-landing review of the full diff against base.

1. Run `git diff origin/<base>...HEAD` to get the full diff.
2. Read every changed file (full file, not just hunks) to understand context.
3. Review for:

**Critical (STOP and flag):**
- SQL injection, XSS, command injection
- Hardcoded secrets, API keys, tokens
- `console.log` with sensitive data
- Broken imports (referencing files/modules that don't exist)
- Obvious logic bugs (unreachable code, inverted conditions, off-by-one)

**Warning (note in summary, don't stop):**
- `console.log` / `console.debug` left in (non-sensitive)
- TODO/FIXME/HACK comments introduced
- Unused imports or variables
- Large functions added (50+ lines) — note for awareness
- Missing error handling on API calls or async operations

**Auto-fix (fix silently, note what was fixed):**
- Trailing whitespace
- Missing newline at end of file

4. Output summary:
   - `Review: N issues — M critical, K warnings, J auto-fixed`
   - Or: `Review: Clean — no issues found.`

If critical issues found, **STOP** and present them. User decides: fix or ship anyway.

### Step 4: Checkpoint — Ship Summary

**Always stop here.** Present the full picture before pushing:

```
SHIP SUMMARY
═══════════════════════════════
Branch:    <feature-branch> → <base>
Commits:   N commits
Files:     M files changed (+X/-Y)
Tests:     ✓ passed (N tests) | ✗ failed | ⚠ no tests
Review:    ✓ clean | ⚠ N warnings | ✗ N critical issues
Version:   X.Y.Z → X.Y.Z+1 (if applicable)

Ready to push and create PR?
```

Options:
- A) Ship it — push + create PR
- B) Ship with edits — let me adjust something first
- C) Abort — don't ship

### Step 5: Version & Changelog (Conditional)

**Only run if VERSION or CHANGELOG.md exists in the repo root or project root.**

If VERSION file exists:
- Read current version
- Auto-bump: PATCH for most changes, ask for MINOR/MAJOR
- Write new version

If CHANGELOG.md exists:
- Read header to match format
- Auto-generate entry from `git log <base>..HEAD --oneline` and `git diff <base>...HEAD`
- Categorize: Added, Changed, Fixed, Removed
- Insert after header, dated today
- Format: `## [X.Y.Z] - YYYY-MM-DD`

If neither exists: skip silently.

### Step 6: Commit

Check if there are uncommitted changes (from merge, auto-fixes, version bump, changelog):

1. If changes exist, commit them.
2. **Check for `committer` on PATH** — if available, use it:
   ```bash
   committer <file1> <file2> ... -m "type: description"
   ```
   If `./scripts/committer` exists in the repo, prefer that.
3. If no committer available, use standard git:
   ```bash
   git add <specific-files>
   git commit -m "type: description"
   ```
4. **Check project's CLAUDE.md** for commit conventions:
   - Some projects forbid Co-Authored-By tags
   - Some have specific commit message formats
   - Respect these — read CLAUDE.md before composing the message
5. Commit message style: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)

### Step 7: Push

```bash
git push -u origin <branch-name>
```

**Never force push.** If push fails due to divergence, fetch + rebase and try once more. If that fails, STOP.

### Step 8: Create PR

```bash
gh pr create --base <base> --title "<type>: <summary>" --body "$(cat <<'EOF'
## Summary
<bullet points — what changed and why>

## Tests
<test results: framework, pass count, or "No test framework configured">

## Review
<review findings summary, or "No issues found">

## Changes
<file list with brief descriptions>
EOF
)"
```

**PR title:** Under 70 chars, conventional commit style.
**PR body:** Keep it concise. Include test results and review findings.

Output the PR URL as the final line.

## Important Rules

- **Never skip tests** if a framework is detected. If tests fail, stop.
- **Never force push.**
- **Never push without the Step 4 checkpoint.** The user always sees the summary before push.
- **Always check CLAUDE.md** in the project root for project-specific rules (commit format, push restrictions, attribution rules).
- **Respect `committer`** — it's the preferred commit tool. Use it if on PATH.
- **VERSION/CHANGELOG are opt-in** — only touch them if they already exist.
- **Auto-fix sparingly** — only truly trivial mechanical fixes. Don't refactor during ship.
- **If anything feels wrong, stop and ask.** Better to pause than to ship a problem.

## What This Skill Does NOT Do

- Run a full visual diff-review (use `/diff-review` for that)
- Generate test coverage reports (use test-driven-development skill)
- Deploy to production (this creates a PR, deployment is CI/CD's job)
- Rewrite or refactor code (ship what's there, or abort)
