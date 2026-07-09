export const meta = {
  name: 'route',
  description: 'Run tasks routed to the right model per CLAUDE.md: gpt-5.5 via codex wrapper, sonnet/opus/fable native',
  whenToUse: 'Multi-task fan-out where model routing matters. args: {tasks:[{prompt, kind, label?, write?, cwd?, crosscheck?}]}, a bare task array, or a single prompt string (routed as hard). kinds: bulk (gpt-5.5), ui (opus), review (fable, crosscheck:true adds gpt-5.5 angle), general (sonnet), hard (fable, default).',
  phases: [{ title: 'Run' }],
}

// Routing table from CLAUDE.md "Picking the right models":
//   bulk/mechanical (clear-spec impl, data analysis, migrations) -> gpt-5.5, near-free
//   user-facing (UI, copy, API design) -> taste >= 7 -> opus-4.8
//   reviews -> fable-5, gpt-5.5 optional extra angle (crosscheck: true)
//   hard/unsupervised -> fable-5 (intelligence 9)
//   general glue -> sonnet-5
const ROUTES = {
  bulk:    { via: 'codex' },
  ui:      { via: 'claude', model: 'opus' },
  review:  { via: 'claude', model: 'fable' },
  general: { via: 'claude', model: 'sonnet' },
  hard:    { via: 'claude', model: 'fable' },
}

// Stringified-JSON args silently becomes one giant "hard" prompt — parse it first.
let input = args
if (typeof input === 'string') {
  try { input = JSON.parse(input) } catch { /* plain prompt string */ }
}
const tasks = typeof input === 'string' ? [{ prompt: input, kind: 'hard' }]
  : Array.isArray(input) ? input
  : (input && input.tasks) || []
if (!tasks.length) throw new Error('No tasks. Pass args: {tasks:[{prompt, kind}]}, a task array, or a prompt string.')

// gpt-5.5 has no native model param — thin sonnet wrapper shells out to codex exec.
function codexAgent(t, label) {
  const sandbox = t.write ? 'workspace-write' : 'read-only'
  const cd = t.cwd ? ` -C '${t.cwd}'` : ''
  return agent(
`You are a thin wrapper around the Codex CLI (gpt-5.5). Do NOT solve the task yourself — your only job is to delegate it to codex and relay the result.

1. Create temp files: PROMPT_FILE=$(mktemp) OUT_FILE=$(mktemp)
2. Write the codex prompt below into PROMPT_FILE exactly as-is, using a quoted heredoc (cat > "$PROMPT_FILE" <<'CODEX_PROMPT_EOF' ... CODEX_PROMPT_EOF) so nothing is shell-expanded.
3. Run via Bash with timeout 600000:
   codex exec -s ${sandbox} --ephemeral${cd} -o "$OUT_FILE" - < "$PROMPT_FILE"
4. Exit 0: return the contents of OUT_FILE verbatim as your final message — nothing else, no commentary.
   Nonzero: return "CODEX-ERROR: " followed by the last 30 lines of the command output.

The codex prompt is everything between the markers (exclusive):
===BEGIN CODEX PROMPT===
${t.prompt}
===END CODEX PROMPT===`,
    { label: `gpt-5.5:${label}`, model: 'sonnet', effort: 'low', phase: 'Run' })
}

function claudeAgent(t, model, label) {
  return agent(t.prompt, { label: `${model}:${label}`, model, phase: 'Run' })
}

phase('Run')
const results = await pipeline(tasks, (t, _orig, i) => {
  const kind = ROUTES[t.kind] ? t.kind : 'hard'
  const label = t.label || `${kind}-${i}`
  const route = ROUTES[kind]
  log(`${label}: ${kind} -> ${route.via === 'codex' ? 'gpt-5.5 (codex)' : route.model}`)

  if (route.via === 'codex')
    return codexAgent(t, label).then(output => ({ label, kind, model: 'gpt-5.5', output }))

  if (kind === 'review' && t.crosscheck)
    return parallel([
      () => claudeAgent(t, route.model, label),
      () => codexAgent(t, `${label}-xcheck`),
    ]).then(([main, xcheck]) => ({ label, kind, model: `${route.model}+gpt-5.5`, output: main, crosscheck: xcheck }))

  return claudeAgent(t, route.model, label).then(output => ({ label, kind, model: route.model, output }))
})

return { results: results.filter(Boolean) }
