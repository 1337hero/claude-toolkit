export const meta = {
  name: 'code-quality-enforcer',
  description: 'Frontend quality enforcement: DHH craft + six React masters + house rules, every finding adversarially verified',
  whenToUse: 'After writing or modifying React/Preact/JS/TS frontend code. args: file paths (string or array), or omit to review the current git changes.',
  phases: [
    { title: 'Scope', detail: 'resolve targets, profile the codebase' },
    { title: 'Review', detail: 'eight parallel lenses + coverage sweep' },
    { title: 'Verify', detail: 'adversarial refutation; criticals face a three-judge panel' },
    { title: 'Synthesize', detail: 'prioritized DHH-style verdict report' },
  ],
}

// ---------------------------------------------------------------- doctrine

const HOUSE_RULES = `HOUSE RULES (authoritative — when any reviewer philosophy conflicts with these, these win):
- Stack defaults: Bun runtime (fallback npm — never pnpm/yarn), Vite bundler with the @/ path alias, React/Preact + TanStack Query/Router, Tailwind utilities with cn() for class merging, UI primitives on the shadcn/ui pattern (Radix primitives, CVA for variants), Zustand or Preact Signals for client state, @remixicon/react icons (Ri*Line outline, Ri*Fill solid).
- No TypeScript in house projects: .jsx components, .js utilities, runtime validation at system boundaries, JSDoc for genuinely complex functions. If the project under review already uses TypeScript, judge that TypeScript on its merits — but NEVER recommend migrating a JavaScript project to TypeScript.
- Component structure, in this order: 1 server state (TanStack Query), 2 global client state, 3 local useState, 4 refs, 5 custom hooks, 6 derived values computed in render, 7 effects, 8 event handlers; then early returns for loading/error before the main return.
- TanStack Query is the ONLY source of truth for server data (v5 idioms: gcTime, not cacheTime). Pages fetch, children receive props, children never refetch what a parent already has.
- Client state (Zustand/Signals/useState) is for UI concerns ONLY — and those UI concerns are legitimate there: modals, theme, sidebar, filters, form inputs.
- useEffect is legitimate for exactly three things: DOM synchronization, external subscriptions, analytics. Anything else belongs in an event handler or TanStack Query.
- NEVER: useCallback (almost never justified); useMemo without profiling data; useState for derivable values; server data duplicated into client state; barrel files (index re-exports); prop drilling past 2 levels; business logic inside components (extract to hooks/utilities); more than one client-state library; inline styles or global CSS; abstraction before 3 real use cases; thin custom wrappers around libraries; comments where a better name would do.
- Naming and files: PascalCase component files, camelCase everything else; handle* event handlers, use* hooks, render* render helpers; feature-based folders (components/billing/), never type-based (components/forms/); canonical layout: src/components (ui/, <feature>/, common/), src/hooks, src/stores, src/constants, src/lib, src/pages, src/api.
- UI: buttons rounded-full, cards rounded-xl, data-slot attributes for CSS targeting, composition (children/slots) over configuration props.
- Formatting: Prettier defaults — 2-space indent, double quotes, semicolons, 100-char width, ES5 trailing commas, Tailwind plugin class ordering.`

const SEVERITY_BAR = `Severity calibration:
- critical: a real bug, a performance problem users will feel, or architecture corruption (e.g. server data copied into client state, effect-driven state sync, race conditions in async UI).
- important: maintainability and architecture violations — every breach of a NEVER rule is at least important.
- nice-to-have: refinements and polish a good reviewer would still mention.`

const LENSES = [
  {
    key: 'dhh',
    name: 'DHH — craft, elegance, conceptual compression',
    focus: `Channel David Heinemeier Hansson. Code should be DRY, concise, elegant, idiomatic, self-documenting. Omakase: one best way to do things, not ten. Majestic monolith: colocate related concerns, don't split unnecessarily. No astronaut architecture: build for today, not imaginary futures. Clarity over brevity, boring proven patterns over clever ones. Comments are a code smell — the fix is a better name, not a sentence.
Hunt: duplication; nested ternaries; promise chains that should be async/await; callback nesting; class components where functions work; manual loops where map/filter/reduce read better; abstractions with a single caller; speculative configurability; dead code and unused exports; names that lie or mumble; props spreading that hides a component's contract; context where props would do; custom hooks that extract logic but abstract nothing real.`,
  },
  {
    key: 'tanner',
    name: 'Tanner Linsley — server state and async data',
    focus: `Channel Tanner Linsley (TanStack). Server state is not client state: API data belongs in TanStack Query and only there.
Hunt: server data fetched in useEffect and parked in useState; queryKeys missing variables the queryFn depends on; request waterfalls that should be parallel queries or prefetches; mutations without invalidation, or without optimistic updates where the UX demands them; stale v4 idioms (cacheTime instead of gcTime); hand-rolled isLoading/error flags instead of the query's own; children refetching what a parent already fetched.`,
  },
  {
    key: 'ryan',
    name: 'Ryan Florence — web platform and progressive enhancement',
    focus: `Channel Ryan Florence (Remix). The platform is the framework: prefer native forms, anchors, URL state, and browser APIs over reinvented JavaScript.
Hunt: form state machines hand-built where a <form> with a submit handler would do; div-with-onClick instead of real buttons and links (also an accessibility failure); state the user would expect to survive a refresh or a shared link (deep-linkable tabs, pagination, search) trapped in component state — while respecting that the house rules sanction modals, theme, sidebar, filters, and form inputs as plain client state; data loaded ad hoc in components instead of at the route/page level; custom implementations of things the platform ships (scroll restoration, focus management, validation attributes).`,
  },
  {
    key: 'kent',
    name: 'Kent C. Dodds — testing and AHA',
    focus: `Channel Kent C. Dodds. "The more your tests resemble the way your software is used, the more confidence they can give you." AHA: avoid hasty abstractions — prefer duplication over the wrong abstraction. State colocation: state lives as close to where it's used as possible.
Hunt: tests asserting implementation details (internal state, mock call counts as the only assertion) instead of user-visible behavior; querying by test-id where role/label queries exist; behavior-critical code with no tests at all; abstractions created on the first or second use case; state lifted higher than its consumers need; test utilities more complex than the code under test.`,
  },
  {
    key: 'matt',
    name: 'Matt Pocock — type safety at the boundaries',
    focus: `Channel Matt Pocock (Total TypeScript), adapted to the codebase profile you are given.
If the project is JavaScript (the house default): do NOT recommend TypeScript. Hunt instead for missing runtime validation at system boundaries (API responses, form input, localStorage, URL params consumed without checking shape); magic strings and numbers that should be shared constants; complex functions whose contracts deserve JSDoc.
If the project already uses TypeScript: hunt for any-escapes and as-casts papering over real questions; explicit annotations where inference is cleaner; type gymnastics and generics that obscure intent; interface ceremony where a simple type alias reads better; types that don't model the actual states (boolean flags that should be discriminated unions, and unions where nothing is discriminated); TypeScript performance pitfalls (deep conditional or recursive types, giant unions that slow the checker); React-specific typing of props and hooks where the pattern fights inference.`,
  },
  {
    key: 'dan',
    name: 'Dan Abramov — mental models and composition',
    focus: `Channel Dan Abramov. Hooks are memory cells; rendering is a pure function of props and state; effects synchronize with external systems — they are not lifecycle hooks and not a place to compute state.
Hunt: effects that set state in response to state (derive in render or move to the event handler); effects missing or lying about dependencies; state that should be derived; components that break under re-render, StrictMode double-invoke, or out-of-order async resolution (races, stale closures); "clean code" abstractions that hurt resilience and readability; client/server boundary confusion; composition problems solved with configuration props instead of children; where the framework actually supports it, work that could be static or server-rendered done client-side instead (The Two Reacts — judge against the codebase profile, not aspiration).`,
  },
  {
    key: 'theo',
    name: 'Theo Browne — simplicity and production realism',
    focus: `Channel Theo Browne (t3.gg). Simplicity by default, and contracts that hold end to end — the UI must survive production.
Hunt: every dependency that doesn't pay rent (could be ten lines of code or a platform API); API contracts maintained by hand and vibes — boundary shapes unvalidated and duplicated between client and server; missing loading/empty/error states for real network conditions; async UI that breaks on slow connections, retries, or double-clicks; premature package/microservice splits; DX hazards the next developer will trip on.`,
  },
  {
    key: 'house',
    name: 'House rules — frontend-philosophy compliance audit',
    focus: `You are the mechanical compliance auditor for the house rules below. Check every rule against every file: the 8-section component order; TanStack Query as sole owner of server state; the three legitimate useEffect uses; the full NEVER list; naming, folder, and formatting conventions; styling and UI patterns. Every NEVER-list breach is at least "important". Cite the exact rule in "principle". You are the one lens where pedantry is the job — but cite real rules, not taste.`,
  },
]

// ---------------------------------------------------------------- schemas

const SCOPE_SCHEMA = {
  type: 'object',
  required: ['files', 'excluded', 'profile'],
  properties: {
    files: { type: 'array', items: { type: 'string', minLength: 1 } },
    excluded: { type: 'array', items: { type: 'string' } },
    profile: {
      type: 'object',
      required: ['language', 'framework', 'stateLibs', 'hasTests', 'summary'],
      properties: {
        language: { type: 'string', enum: ['javascript', 'typescript', 'mixed'] },
        framework: { type: 'string' },
        stateLibs: { type: 'array', items: { type: 'string' } },
        hasTests: { type: 'boolean' },
        summary: { type: 'string' },
      },
    },
  },
}

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['findings', 'praise'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'line', 'severity', 'title', 'principle', 'evidence', 'fix'],
        properties: {
          file: { type: 'string', minLength: 1 },
          line: { type: 'number' },
          severity: { type: 'string', enum: ['critical', 'important', 'nice-to-have'] },
          title: { type: 'string' },
          principle: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
    praise: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'what'],
        properties: { file: { type: 'string', minLength: 1 }, what: { type: 'string' } },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['refuted', 'reason', 'severity', 'fixUnsafe'],
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string' },
    severity: { type: 'string', enum: ['critical', 'important', 'nice-to-have'] },
    fixUnsafe: { type: 'boolean' },
  },
}

const REPORT_SCHEMA = {
  type: 'object',
  required: ['verdict', 'report'],
  properties: {
    verdict: { type: 'string', enum: ['SHIP', 'NEEDS WORK', 'REJECT'] },
    report: { type: 'string' },
  },
}

// ---------------------------------------------------------------- phase 1: scope

phase('Scope')

const target =
  args == null || args === '' || (Array.isArray(args) && !args.length)
    ? 'the current git changes: staged, unstaged, and commits on this branch that are not on the default branch (use git merge-base)'
    : Array.isArray(args) ? `these paths: ${args.join(', ')}`
    : typeof args === 'object' ? `this target spec: ${JSON.stringify(args)}`
    : String(args)

const scope = await agent(`You are scoping a frontend code-quality review. Resolve this target into a concrete list of reviewable source files: ${target}

- If the target describes git changes, run git (status, diff --name-only, merge-base with main/master) to collect changed files.
- If the target names paths, expand directories to the source files inside them.
- Keep only frontend source: components, hooks, stores, pages, utilities, api clients, tests (.jsx/.tsx/.js/.ts). Exclude node_modules, build output, lockfiles, generated code, config boilerplate, and non-code files; list everything you excluded (with a word on why) in "excluded".
- If there are more than 40 files, keep the 40 most substantive and put the rest in "excluded" marked "over cap".
- Return ABSOLUTE paths for "files", and only files that actually exist.
- Profile the codebase: language (javascript/typescript/mixed), framework (react/preact/other), state libraries actually in use (check package.json and imports), whether tests exist, and a two-sentence summary of what this code does.`,
  { label: 'scope', phase: 'Scope', schema: SCOPE_SCHEMA })

if (!scope) return { verdict: 'ABORTED', report: 'Scope agent failed; nothing was reviewed.' }
if (!scope.files.length) {
  return {
    verdict: 'NOTHING TO REVIEW',
    report: `No reviewable frontend source files matched the target (${target}).` +
      (scope.excluded.length ? ` Excluded: ${scope.excluded.join('; ')}` : ''),
  }
}

if (scope.files.length > 40) {
  scope.excluded.push(`${scope.files.length - 40} additional files dropped over the 40-file cap`)
  scope.files = scope.files.slice(0, 40)
}

log(`reviewing ${scope.files.length} files — ${scope.profile.language}/${scope.profile.framework}, state: ${scope.profile.stateLibs.join('+') || 'none detected'}`)
if (scope.excluded.length) log(`excluded from review: ${scope.excluded.join('; ')}`)

// ---------------------------------------------------------------- phase 2: review

phase('Review')

const finderPrompt = (lens) => `You are a code reviewer applying exactly one lens: ${lens.name}.

${lens.focus}

${HOUSE_RULES}

${SEVERITY_BAR}

Codebase profile: ${JSON.stringify(scope.profile)}

Review every one of these files — Read each fully, Grep/Glob for cross-file context when a claim depends on it:
${scope.files.join('\n')}

Rules of engagement:
- Stay inside your lens; seven other lenses run in parallel and cover the rest.
- Every finding must name the principle violated, the cost of leaving it, and a concrete fix ("fix" shows before/after code when that clarifies). Where the fix is disruptive, acknowledge the migration cost and name the trade-off — balance idealism with pragmatism, and respect patterns this codebase already has rather than inventing new ones.
- The ship test behind every call you make: could a junior dev understand this code, and is it the simplest thing that works?
- "evidence" quotes the actual offending code; "file" is the exact absolute path you were given; "line" is where the offense starts.
- The bar is exemplary, not good-enough — but no nitpick floods: if it isn't worth a developer's time, don't report it.
- Also report praise: code that is exemplary through your lens and worth replicating.`

const sweepPrompt = (files) => `You are the coverage sweeper of a multi-lens code review. The first pass produced no findings and no praise for the files below — either they are genuinely clean or the reviewers skimmed them. Re-review each through ALL lenses, condensed:
${LENSES.map((l) => `- ${l.name}`).join('\n')}

${HOUSE_RULES}

${SEVERITY_BAR}

Files:
${files.join('\n')}

Read each file fully. Report findings exactly as a lens reviewer would: principle, cost, concrete fix, quoted evidence, exact absolute path, starting line. If a file is genuinely clean, return a praise entry for it saying so — every file must end up either flagged or praised.`

const RANK = { critical: 3, important: 2, 'nice-to-have': 1 }
const merged = []
const praise = []

const canonical = (p) => scope.files.find((s) => s === p || s.endsWith('/' + p)) || null

const absorb = (review, lensKey) => {
  if (!review) return 0
  for (const p of review.praise) praise.push({ file: canonical(p.file) || p.file, what: p.what, lens: lensKey })
  for (const f of review.findings) {
    let file = canonical(f.file)
    if (!file) {
      log(`${lensKey}: reported path not in scope, keeping as-is — ${f.file}`)
      file = f.file
    }
    const claim = { lens: lensKey, title: f.title, principle: f.principle, evidence: f.evidence, fix: f.fix }
    const dup = merged.find((m) => m.file === file && Math.abs(m.line - f.line) <= 5)
    if (dup) {
      if (!dup.lenses.includes(lensKey)) dup.lenses.push(lensKey)
      if (RANK[f.severity] > RANK[dup.severity]) {
        dup.severity = f.severity
        dup.line = f.line
        dup.claims.unshift(claim)
      } else if (dup.claims.length < 4 && !dup.claims.some((c) => c.title === f.title)) {
        dup.claims.push(claim)
      }
      dup.claims = dup.claims.slice(0, 4)
    } else {
      merged.push({ file, line: f.line, severity: f.severity, lenses: [lensKey], claims: [claim] })
    }
  }
  return review.findings.length
}

const reviews = await parallel(LENSES.map((l) => () =>
  agent(finderPrompt(l), { label: `find:${l.key}`, phase: 'Review', schema: FINDINGS_SCHEMA })))

const deadLenses = []
LENSES.forEach((l, i) => {
  if (reviews[i]) log(`${l.key}: ${absorb(reviews[i], l.key)} findings, ${reviews[i].praise.length} praise`)
  else {
    deadLenses.push(l.name)
    log(`${l.key}: lens failed or was skipped — its perspective is missing from this review`)
  }
})
log(`${merged.length} unique findings after cross-lens dedup`)

const uncoveredFiles = () => {
  const touched = new Set([...merged.map((f) => f.file), ...praise.map((p) => p.file)])
  return scope.files.filter((f) => !touched.has(f))
}

let unreviewed = []
const uncovered = uncoveredFiles()
if (uncovered.length) {
  log(`coverage sweep: ${uncovered.length} files got neither findings nor praise — re-checking`)
  const chunks = []
  for (let i = 0; i < uncovered.length; i += 10) chunks.push(uncovered.slice(i, i + 10))
  const sweeps = await parallel(chunks.map((c, i) => () =>
    agent(sweepPrompt(c), { label: `sweep:${i + 1}`, phase: 'Review', schema: FINDINGS_SCHEMA })))
  sweeps.forEach((s, i) => {
    if (s) absorb(s, 'sweep')
    else log(`sweep chunk ${i + 1} failed — files may be unreviewed: ${chunks[i].join(', ')}`)
  })
  unreviewed = uncoveredFiles()
  if (unreviewed.length) log(`${unreviewed.length} files remain UNREVIEWED: ${unreviewed.join(', ')}`)
  log(`${merged.length} unique findings after sweep`)
}

// ---------------------------------------------------------------- phase 3: verify

phase('Verify')

const PANEL = [
  { key: 'truth', angle: 'Correctness — does the code at that location actually do what the claims say? Hunt for misreadings, stale line numbers, fabricated evidence.' },
  { key: 'impact', angle: 'Materiality — if the claims are true, do they matter? Is "critical" honest or inflated? Would a senior developer spend time on this?' },
  { key: 'fix', angle: 'Fix safety — is the finding itself valid, and separately, would the proposed fix work, preserve behavior, and comply with the house rules? A bad fix does NOT invalidate a true finding: confirm the finding and set fixUnsafe instead.' },
]
const SOLO = { key: 'skeptic', angle: 'Correctness and materiality — does the code actually do what the claims say, and if so, is it worth a developer\'s time?' }

const base = (p) => p.split('/').pop()

const verifyPrompt = (f, angle) => `You are an adversarial code-review judge. Your angle: ${angle}

A reviewer panel claims (one location, ${f.claims.length} claim(s) — judge whether ANY material claim survives):
${JSON.stringify({ file: f.file, line: f.line, severity: f.severity, caughtBy: f.lenses, claims: f.claims }, null, 2)}

Read ${f.file} yourself around line ${f.line}, plus whatever context the claims depend on. Then judge.

${HOUSE_RULES}

${SEVERITY_BAR}

Refute when: the code does not say what the claims say; the pattern is actually correct or justified in this context (including anything the house rules above explicitly sanction); or the issue is too trivial to be worth a developer's time. A bad suggested fix is NOT grounds for refutation — judge the finding itself, and set "fixUnsafe": true when a proposed fix would break behavior or violate the house rules (the final report will correct the fix). Default to refuted when uncertain.
Always set every field: "severity" (echo the reviewer's severity if you refute; your honest calibration if you confirm) and "fixUnsafe" (false if the fixes are fine or you refute).`

const judgeFinding = (f, idx, judges, tag) =>
  parallel(judges.map((j) => () =>
    agent(verifyPrompt(f, j.angle), { label: `judge${tag}:${j.key}:${idx}:${base(f.file)}:${f.line}`, phase: 'Verify', schema: VERDICT_SCHEMA })))
    .then((votes) => {
      const cast = votes.filter(Boolean)
      if (cast.length < judges.length) log(`judge loss on ${base(f.file)}:${f.line} — ${judges.length - cast.length} of ${judges.length} judges died`)
      if (!cast.length) return { ...f, idx, panel: judges.length, confirmed: false, unverified: true, judgeNotes: [] }
      const yes = cast.filter((v) => !v.refuted)
      if (yes.length < Math.ceil(cast.length / 2)) {
        return { ...f, idx, panel: judges.length, confirmed: false, unverified: false, judgeNotes: cast.map((v) => v.reason) }
      }
      const counts = {}
      for (const v of yes) counts[v.severity] = (counts[v.severity] || 0) + 1
      const severity = Object.entries(counts).sort((a, b) => b[1] - a[1] || RANK[b[0]] - RANK[a[0]])[0][0]
      return {
        ...f, idx, panel: judges.length, confirmed: true, unverified: false, severity,
        fixUnsafe: yes.some((v) => v.fixUnsafe), judgeNotes: yes.map((v) => v.reason),
      }
    })

const JUDGE_CAP = 200
const ordered = [...merged].sort((a, b) => RANK[b.severity] - RANK[a.severity])
const toJudge = ordered.slice(0, JUDGE_CAP)
const overflow = ordered.slice(JUDGE_CAP)
if (overflow.length) log(`verification capped at ${JUDGE_CAP} findings — ${overflow.length} lower-severity findings go to the report unverified`)

let confirmed = []
let killed = []
let unverified = []
if (toJudge.length) {
  const judged = await parallel(toJudge.map((f, idx) => () =>
    judgeFinding(f, idx, f.severity === 'critical' ? PANEL : [SOLO], '')))

  const promoted = judged.filter((j) => j.confirmed && j.severity === 'critical' && j.panel === 1)
  if (promoted.length) {
    log(`${promoted.length} solo-judge escalations to critical — convening full panels`)
    const rejudged = await parallel(promoted.map((f) => () => judgeFinding(f, f.idx, PANEL, ':panel2')))
    for (const r of rejudged) judged[r.idx] = r
  }

  confirmed = judged.filter((j) => j.confirmed)
  killed = judged.filter((j) => !j.confirmed && !j.unverified)
  unverified = judged.filter((j) => j.unverified)
  log(`verification: ${confirmed.length} confirmed, ${killed.length} refuted${unverified.length ? `, ${unverified.length} unverified (judges unavailable)` : ''}`)
} else {
  log('zero findings — skipping verification')
}
unverified = unverified.concat(overflow)

// ---------------------------------------------------------------- phase 4: synthesize

phase('Synthesize')

const clip = (s, n) => (s && s.length > n ? s.slice(0, n) + '…' : s)
const compact = (list) => list.map((f) => ({
  file: f.file, line: f.line, severity: f.severity, lenses: f.lenses,
  fixUnsafe: f.fixUnsafe || false,
  claims: f.claims.map((c) => ({
    lens: c.lens, title: c.title,
    principle: clip(c.principle, 300), evidence: clip(c.evidence, 400), fix: clip(c.fix, 500),
  })),
  judgeNote: clip((f.judgeNotes || [])[0], 300),
}))

if (praise.length > 80) log(`praise capped at 80 of ${praise.length} entries for synthesis`)
const compactPraise = praise.slice(0, 80).map((p) => ({ file: p.file, lens: p.lens, what: clip(p.what, 200) }))

const caveats = []
if (deadLenses.length) caveats.push(`these review lenses failed, so their perspective is missing: ${deadLenses.join(', ')}`)
if (unreviewed.length) caveats.push(`these files were never reviewed by any agent: ${unreviewed.join(', ')}`)

const synthPrompt = `You are writing the final report of a multi-agent code quality review that combined DHH's craft standards, six React masters (Tanner Linsley, Ryan Florence, Kent C. Dodds, Matt Pocock, Dan Abramov, Theo Browne), and the house frontend conventions. Every confirmed finding below survived adversarial verification.

Tone: DHH-direct — honest, specific, no sugar-coating, and equally direct about craft where it exists. Educational where it helps: name the principle and the master it comes from; quote them when apt. Balance idealism with pragmatism: where a fix is disruptive, acknowledge the migration cost and name the trade-off.

Codebase profile: ${JSON.stringify(scope.profile)}
Files in scope (${scope.files.length}): ${scope.files.join(', ')}
Coverage caveats (state these plainly in the Overall Assessment): ${caveats.join(' | ') || 'none — full coverage'}

Confirmed findings:
${JSON.stringify(compact(confirmed))}

Reported but NOT individually verified (judge agents unavailable or over the verification cap — include under a clearly marked "Unverified" subsection with appropriate hedging, never silently drop):
${JSON.stringify(compact(unverified))}

Refuted in verification (context only — do NOT include these): ${killed.map((k) => k.claims[0].title).join('; ') || 'none'}

Praise collected by reviewers:
${JSON.stringify(compactPraise)}

Write "report" as GitHub-flavored markdown:
1. **Overall Assessment** — one direct paragraph: the state of this code, the dominant failure patterns, what is genuinely strong, plus any coverage caveats.
2. **Critical — fix before shipping**, then **Important — architecture and maintainability**, then **Nice-to-have** (omit empty sections; put unverified findings in their own subsection). Each finding: \`file:line\` — title (lenses that caught it) — the principle and its cost — the fix. For the top issues, Read the file and show accurate before/after code. Where "fixUnsafe" is true the judges flagged the reviewer's proposed fix as breaking behavior or house rules: Read the file and write a correct fix yourself instead of repeating the reviewer's.
3. **Refactored Version** — if any single file needs significant work, provide a complete DHH-worthy rewrite of it.
4. **What Works Well** — merge and deduplicate the praise; name the patterns worth replicating.
5. **Learn More** — only resources relevant to the actual findings (TanStack Query docs, Remix docs, Testing Library, Total TypeScript, overreacted.io, t3.gg).
End the report with the verdict framed as: would DHH and the six masters let this into production?

Set "verdict" from confirmed findings only (unverified findings inform tone, not the verdict): SHIP (exemplary, or nice-to-haves only), NEEDS WORK (real confirmed findings to address), REJECT (confirmed critical bugs or architecture corruption).`

const final = await agent(synthPrompt, { label: 'verdict', phase: 'Synthesize', schema: REPORT_SCHEMA })

return {
  verdict: final ? final.verdict : 'NEEDS WORK',
  report: final ? final.report : `Synthesis agent failed. Raw confirmed findings: ${JSON.stringify(compact(confirmed))}`,
  stats: {
    filesScoped: scope.files.length,
    filesUnreviewed: unreviewed.length,
    lensFailures: deadLenses,
    uniqueFindings: merged.length,
    confirmed: confirmed.length,
    refuted: killed.length,
    unverified: unverified.length,
    praise: praise.length,
  },
}
