---
name: localmaxxing
description: "LocalMaxxing API for local-LLM benchmark + eval leaderboards. Trigger: submitting benchmarks, pushing tok/s or eval scores."
disable-model-invocation: true
---

# LocalMaxxing API

Public leaderboard for local LLM throughput + quality evals. Two surfaces:
- **Benchmarks** — tok/s, TTFT, VRAM, hardware
- **Evals** — task-level quality scores against named suites (register your own — see Eval section)

Benchmarks **auto-approve**; **eval runs land PENDING → admin approval**. Rate limit is **30 submissions per rolling hour per API key (300 for Pro)** — benchmarks and evals have **separate** windows. Read `X-RateLimit-Remaining`/`-Reset` headers to self-throttle. (verified 2026-06-25)

## Authentication

Bearer token, prefixed `bhk_` (40 hex). Load before every call:

```bash
export $(grep LOCALMAXXING_API_KEY /home/mikekey/.env | xargs)
```

If the env var isn't in `~/.env` yet, get a key from a logged-in browser session:

```js
// In devtools console at https://www.localmaxxing.com (signed in via HF or GitHub)
await fetch('/api/keys', {method:'POST', headers:{'Content-Type':'application/json'},
  body:'{"name":"archbox"}'}).then(r=>r.json())
// Raw bhk_… token returned ONCE — copy immediately into /home/mikekey/.env
```

There is no UI page for keys — `/api/keys` is the only path.

## Base URL

`https://www.localmaxxing.com`

## Bootstrap context (live)

Before doing anything non-trivial, pull the canonical agent context — it's authoritative and updated server-side:

```bash
curl -s https://www.localmaxxing.com/api/agent-context | jq
```

It returns: required/optional fields, hardware schemas, full `engineFlagsSchema` + `commandParsing` (which CLI flag → which DB field), rate-limit headers, examples for vllm/sglang/Apple-silicon/heterogeneous-GPU/spec-decoding, and the eval submission shape. Treat it as the spec — this SKILL.md is the cheat sheet.

## Endpoints

### Public (no auth)
| Path | Method | Purpose |
|---|---|---|
| `/api/agent-context` | GET | Full machine-readable spec (use this first) |
| `/api/benchmarks` | GET | Approved benchmark results, with filters (`limit`, `offset`, model, hwClass…) |
| `/api/leaderboard` | GET | Ranked by tok/s output — returns model, hardware, engine, **engineFlags**, reactions |
| `/api/models` | GET | Browse models |
| `/api/models/search?q=<query>` | GET | Fuzzy resolve human name → canonical `hfId` (use before submitting) |
| `/api/evals/suites` | GET | List approved suites |
| `/api/evals/suites/{slug}` | GET | Suite definition: tasks, scoring, runConfig, suiteDoc |
| `/api/evals/runs?modelId=…` | GET | Best approved eval run per suite for a model |

### Authenticated
| Path | Method | Purpose |
|---|---|---|
| `/api/benchmarks/dry-run` | POST | Validate without persisting (no rate-limit hit) |
| `/api/benchmarks` | POST | Submit benchmark (rate-limited) |
| `/api/evals/runs/dry-run` | POST | Validate eval payload (no rate-limit hit) |
| `/api/evals/runs` | POST | Submit eval results (rate-limited) |
| `/api/evals/execute` | POST | Server-side execution against your public OpenAI-compat endpoint |
| `/api/evals/suites` | POST | Register custom suite (pending admin approval) |
| `/api/runs/{id}/react` | POST | React to a run with an emoji (or `null` to remove) |
| `/api/setups` | GET/POST | Saved hardware presets (session-only, used by submit page) |
| `/api/keys` | GET/POST | List/create API keys (browser session only) |

## Querying the leaderboard

Leaderboard rows include `model`, `hardware`, `engine`, and parsed `engineFlags` (commandSnippet, tensorParallel, gpuLayers, kvCacheDtype, flashAttn, specDecoding, mtpEnabled, …). Filter client-side with `jq`:

```bash
# Top runs for a model
curl -s "https://www.localmaxxing.com/api/leaderboard?limit=50" \
  | jq '.rows[] | select(.model.hfId=="Qwen/Qwen3-8B")'

# All Vulkan llama.cpp runs sorted by tok/s out
curl -s "https://www.localmaxxing.com/api/leaderboard?limit=200" \
  | jq '[.rows[] | select(.engine.backend=="vulkan" and .engine.engineName=="llama.cpp")] | sort_by(-.tokSOut)'

# Multi-GPU AMD setups using flash-attn
curl -s "https://www.localmaxxing.com/api/leaderboard?limit=200" \
  | jq '.rows[] | select(.hardware.gpuName | test("AMD")) | select(.hardware.gpuCount > 1) | select(.engineFlags.flashAttn==true)'

# Pull the exact commandSnippet of the #1 run for a model — useful as a tuning reference
curl -s "https://www.localmaxxing.com/api/leaderboard?limit=200" \
  | jq -r '[.rows[] | select(.model.hfId=="Qwen/Qwen3.5-0.8B-Base")] | sort_by(-.tokSOut) | .[0].engineFlags.commandSnippet'
```

`/api/benchmarks` accepts query filters (`limit`, `offset`, model, hwClass, etc.) for narrower pulls.

## Resolving fuzzy model names

**Do NOT rely on `/api/models/search` — it returns empty results unreliably.** Instead:

1. **Check Mike's existing submissions first** — hfId is in the response and the alias→hfId mapping is already solved:
```bash
export $(grep LOCALMAXXING_API_KEY /home/mikekey/.env | xargs)
curl -s "https://www.localmaxxing.com/api/benchmarks?limit=100" \
  | jq '[.benchmarks[] | select(.user.username == "1337Hero")] | .[] | {alias: "?", hfId: .model.hfId, quant: .engine.quantization, tokSOut, status}'
```

2. **Check the leaderboard** for any hfId that matches the model family:
```bash
curl -s "https://www.localmaxxing.com/api/leaderboard?limit=200" | jq '[.rows[] | select(.model.hfId | test("(?i)qwen"; "i"))] | .[] | .model.hfId' | sort -u
```

3. **Known alias → hfId map** (llama-swap aliases don't match hfIds — use this table):

| llama-swap alias | hfId | quant |
|---|---|---|
| `Qwen-Coder-30B` / `Qwen-Coder-30B-fast` / `Qwen-Coder-30B-rocm` | `Qwen/Qwen3-Coder-30B-A3B-Instruct` | Q8_0 |
| `Qwen3-Coder-Next` | `Qwen/Qwen3-Coder-Next` | MXFP4_MOE |
| `Qwen3.5-122B` | `Qwen/Qwen3.5-122B-A10B` | MXFP4_MOE |
| `Qwen3.6` / `Qwen3.6-fast` | `Qwen/Qwen3.6-35B-A3B` | Q8_0 |
| `Qwen3.6-27B` / `Qwen3.6-27B-fast` | `Qwen/Qwen3.6-27B` | Q8_0 |
| `GLM-4.7-Flash` | `zai-org/GLM-4.7-Flash` | MXFP4_MOE (vLLM) or Q8_0 (gguf) |
| `GPT-OSS` | `openai/gpt-oss-20b` | Q8_0 |
| `GPT-OSS-120B-F16` | `openai/gpt-oss-120b` | F16 |
| `IBM-Granite` | `ibm-granite/granite-4.1-30b` | Q8_0 |
| `Kimi-Dev-72B` / `Kimi-Dev-72B-spec` | `moonshotai/Kimi-Dev-72B` | Q4_0 |
| `nemotron` | `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16` | Q8_0 |
| `nemotron-cascade-2` | `nvidia/Nemotron-Cascade-2-30B-A3B` | Q8_0 |
| `Devstral-Small-24B` / `Devstral-Small-24B-fast` | `mistralai/Devstral-Small-2-24B-Instruct-2512` | Q8_0 |
| `Gemma4` | `google/gemma-4-26B-A4B-it` | Q4_K_M |
| `Gemma4-MXFP4` | `google/gemma-4-26B-A4B-it` | MXFP4_MOE |
| `Llama3.2-3B` | `meta-llama/Llama-3.2-3B-Instruct` | BF16 |
| `Ornith-1.0-9B` | `deepreinforce-ai/Ornith-1.0-9B` | BF16 |
| `Ornith-1.0-35B` | `deepreinforce-ai/Ornith-1.0-35B` | Q8_0 |

**Never** use the `-GGUF` distribution repos (`deepreinforce-ai/Ornith-1.0-9B-GGUF`) as `hfId` — base repo only. deepreinforce-ai also ships `Ornith-1.0-397B` / `-397B-FP8` upstream.

**Key rule**: `hfId` is always the **upstream base model repo**, never a GGUF-distribution repo. The `-fast`, `-rocm`, `-spec` llama-swap suffixes are config variants of the same model — same hfId, same quant, different `engineFlags`/`commandSnippet`.

## Check for existing submissions before running

Before benching anything, check if Mike already has a result for that model:

```bash
export $(grep LOCALMAXXING_API_KEY /home/mikekey/.env | xargs)
curl -s "https://www.localmaxxing.com/api/benchmarks?limit=100" \
  | jq '[.benchmarks[] | select(.user.username == "1337Hero")] | sort_by(.createdAt) | reverse | .[] | {hfId: .model.hfId, quant: .engine.quantization, backend: .engine.backend, tokSOut, status, createdAt}'
```

If a result exists for the same hfId+quant+backend, show the current best as a baseline ("you're at X tok/s — let's try to beat it") and proceed. Re-benching to climb the leaderboard is the whole point.

## Rate-limit headers

Successful 201s include `X-RateLimit-Remaining` (0|1) and `X-RateLimit-Reset` (Unix seconds). Self-throttle by reading these after every submit; benchmarks and evals have **separate** windows.

## Hardware shape (discriminated union)

`hwClass` selects the schema:

```json
// DISCRETE_GPU
{"hwClass":"DISCRETE_GPU","gpuName":"AMD Radeon AI Pro R9700","gpuCount":3,
 "vramGb":96,"cpuName":"AMD Ryzen 9 5950X","ramGb":64,"os":"Arch Linux"}

// UNIFIED — chip vendor/family/variant, unifiedMemoryGb, npuTops
// CPU_ONLY — cpuName, ramGb, os
```

## Benchmark submission

Required: `hfId`, `quantization`, `engineName`, `hardware`, `tokSOut`, plus ≥1 secondary
metric (`ttftMs`, `tokSPrefill`, `tokSTotal`, or `peakVramGb`).

**Field-name gotcha:** the prefill field is **`tokSPrefill`** (matches the GET response shape),
NOT `prefillTokS`. `/dry-run` returns `valid:true` either way but silently drops the wrong
name, so the real POST then 400s with "at least one additional metric required" (or stores a
blank PREFILL column). Always confirm the secondary metric echoes back in `dry-run.parsed`.

**Prompt-cache gotcha (TTFT/prefill):** llama-server/llama-swap default `cache_prompt:true`,
so a best-of-N loop over an identical prompt makes runs 2..N cache hits — TTFT collapses to
~25ms and prefill inflates to absurd values (this is why old runs showed TTFT≈30ms). Send
`"cache_prompt": false` in every benchmark request to force a cold prefill each run. Decode
(tokSOut) is unaffected. Both `bench_lm.py` and `bench_mac.py` set this.

Optional: `engineVersion`, `backend`, `promptTokens`, `outputTokens`, `contextLength`,
`batchSize`, `engineFlags{}`, `notes` (≤2000 chars).

```bash
curl -s -X POST https://www.localmaxxing.com/api/benchmarks/dry-run \
  -H "Authorization: Bearer $LOCALMAXXING_API_KEY" -H "Content-Type: application/json" \
  -d @bench.json | jq
```

Working script: **`/home/mikekey/models/bench_lm.py`** — wraps llama-swap streaming
chat-completions, runs best-of-3, posts via dry-run then `--submit`.

```bash
LOCALMAXXING_API_KEY=$(grep LOCALMAXXING_API_KEY ~/.env | cut -d= -f2) \
  ~/models/bench_lm.py --alias Qwen3-coder-next-mxfp4 \
  --hf-id unsloth/Qwen3-Coder-Next-MXFP4_MOE-GGUF \
  --quant MXFP4_MOE --backend vulkan --max-tokens 256 --submit
```

## Evals — current state (verified 2026-06-25)

**There are NO pre-seeded suites anymore.** `GET /api/evals/suites` returns `[]` and the old
`local-reasoning-mini`/`hellaswag`/`mmlu` slugs all 404. You must **register your own CUSTOM
suite** first (admin-approved), then run it. Both the suite and each run start PENDING.

### Registering a custom suite — `POST /api/evals/suites`

Schema reverse-engineered from the validator (docs page omits it). Minimal CUSTOM suite that
validates and creates (returns `{id}`):

```json
{
  "slug": "ornith-reasoning-mini",
  "name": "Ornith Reasoning Mini",
  "category": "reasoning",
  "runner": "CUSTOM",                          // body: "CUSTOM" | "LM_EVAL_HARNESS"
  "suiteDoc": {
    "runner": "custom",                        // suiteDoc: "custom" | "lm-eval-harness"
    "scoringMethod": "exact_match",            // exact_match|f1|pass_at_k|perplexity|llm_judge|user_rating|loglikelihood
    "tasks": [{
      "key": "t1",
      "displayName": "Task 1",                 // REQUIRED (not `name`/`title` — only `displayName`)
      "taskType": "qa",                        // optional enum: qa|multiple_choice|code|judge
      "dataset": {
        "source": "inline",                    // huggingface|url|inline|bucket
        "items": [{"input": "2+2?", "gold": "4"}]   // ≥1; inline needs `items`
      }
    }]
  }
}
```

Required keys: body `slug,name,category,runner,suiteDoc`; suiteDoc `runner,scoringMethod,tasks[]`;
task `key,displayName,dataset{source,items}`. `llm_judge` adds a required `suiteDoc.judge` object
(3+ inner required strings) — prefer `exact_match`/`f1` for gold-answer QA. **No DELETE for
suites** (405) — a bad suite sits PENDING (invisible publicly) until an admin clears it.

### Path A — server-side execute (public endpoint)

Only for **approved** CUSTOM suites; `baseUrl` must be public (localhost/Tailscale rejected):

```bash
curl -s -X POST https://www.localmaxxing.com/api/evals/execute \
  -H "Authorization: Bearer $LOCALMAXXING_API_KEY" -H "Content-Type: application/json" \
  -d '{"suiteSlug":"ornith-reasoning-mini","modelHfId":"deepreinforce-ai/Ornith-1.0-9B",
       "endpoint":{"baseUrl":"https://llama.mk3y.com/v1","model":"Ornith-1.0-9B"},
       "autoSubmit":true}' | jq
```

Nested `endpoint{baseUrl,model}` is the working shape. `autoSubmit:true` requires `hardware`.
⚠️ `llama.mk3y.com` needs the Cloudflare tunnel **and** its DNS CNAME live (see setup note).

### Path B — run locally, post results — `POST /api/evals/runs`

Dry-run first (`/api/evals/runs/dry-run`, no rate hit). `results` is a map of every suite
`taskKey → score | {score,nShots,nSamples}`; unknown/missing keys rejected. Optional `artifacts[]`
for per-question traces, or `artifactBundle` for bucket-backed full traces.

```json
{ "suiteSlug":"ornith-reasoning-mini", "hfId":"deepreinforce-ai/Ornith-1.0-9B",
  "hardware": { "hwClass":"DISCRETE_GPU", ... }, "quantization":"BF16",
  "executionMode":"CUSTOM_LOCAL",
  "results": { "t1": 0.8 } }
```

**Gotchas (verified 2026-06-25):**
- Each `artifacts[]` item **requires `prompt` or `objectRef`** (a prompt preview) — else 400 `"prompt or objectRef is required"`. Other fields (`taskKey,itemIndex,score,latencyMs,response,output`) are optional.
- The run dry-run validates **schema first, approval second** — a schema-clean payload against a PENDING suite returns **403 `"not approved (status: PENDING)"`**. So a 403-not-approved means your payload is *correct* and only the suite gate remains. Both suite and run need admin approval.
- **scaffold-bench bridge:** `~/models/eval_bridge.py --results <scaffold results.json> --suite <slug> --hf-id … --quant … [--submit]` maps each scenario's `points/maxPoints`→0-1, attaches artifacts, dry-runs then submits. Suite `scaffold-bench-coding` (CUSTOM, pass_at_k, 50 tasks) registered 2026-06-25, pending maintainer approval.

## Mike's setup (defaults)

**archbox** (primary):
- Public OpenAI-compat endpoint: `https://llama.mk3y.com/v1` (Cloudflare tunnel → llama-swap on archbox)
  - Tunnel is **manual**, no systemd unit: `cloudflared tunnel run` (tunnelID `78144e69-…`). Also needs a DNS CNAME `llama.mk3y.com → <tunnelID>.cfargotunnel.com` (`cloudflared tunnel route dns 78144e69-8a73-43fe-850d-4a402f8f6b69 llama.mk3y.com`). Seen 2026-06-25 with tunnel up but **no DNS record** → endpoint returns connection-refused. Verify with `getent hosts llama.mk3y.com` before any Path-A eval.
- Hardware: 3× R9700, 96 GB VRAM, 5950X, 64 GB RAM, Arch
- Engine for GGUF runs: `llama.cpp` Vulkan (`backend=vulkan`)
- Engine for MXFP4 vLLM runs: `vllm`, quant `MXFP4_MOE`

**macbook** (Apple-silicon comparison rig, added 2026-06-05):
- SSH: `ssh macbook` — passwordless via `~/.ssh/macbook` key (IdentitiesOnly). No llama-swap.
- Hardware: Apple M1 Max, 64 GB unified, macOS 15.7.7 → `hwClass: UNIFIED`, `chipVariant: "M1 Max"`, `backend: metal`
- llama.cpp: prebuilt **b9535** at `~/llamacpp/llama-b9535/` (Metal). Run binaries with `DYLD_LIBRARY_PATH=` that dir.
- Models in `~/models/`. `uv` installed at `~/.local/bin`.
- Bench: **`~/models/bench_mac.py`** (port of bench_lm.py) — start `llama-server` then run it; submit from archbox or set the key.
- For UNIFIED entries `backend` stays `null` server-side (matches canonical Apple example) — that's normal, not a drop.

## Rules

- Always dry-run before real submit — don't burn a submit on a schema error. (Observed limit is ~30/window per `X-RateLimit-Limit`, not 1/5min — read `X-RateLimit-Remaining`/`-Reset` headers rather than trusting a fixed number. Submissions now auto-APPROVE.)
- API key lives in `/home/mikekey/.env` as `LOCALMAXXING_API_KEY` — never inline it in commands the user sees
- For `/api/evals/execute` the endpoint **must be publicly reachable from the LocalMaxxing servers** — Tailscale-only / localhost endpoints fail
- HF model id (`hfId` / `modelHfId`) must be the **upstream base model repo** (e.g. `Qwen/Qwen3.5-122B-A10B`), not a quant-distribution repo (e.g. `noctrex/...-GGUF`). Put the quant string only in the `quantization` field. Use `/api/models/search?q=…` to resolve fuzzy names. Confusingly, `/dry-run` accepts GGUF repo ids; the real `/api/benchmarks` rejects them with 400 + a `suggestedHfId` hint.
- **Runs are now editable/deletable via API** (verified 2026-06-25): `PATCH /api/runs/:id` (benchmark) / `PATCH /api/evals/runs/:id` (eval) — owners may edit within **24h**, 5-min cooldown between edits. `DELETE /api/runs/:id` / `DELETE /api/evals/runs/:id` — owner deletes own run, returns **204**. (Eval *suites* still have no DELETE — 405.)
- For destructive operations (delete, unlist) confirm with user first
- Pre-flight before benching: `systemctl is-active llama-swap || sudo systemctl start llama-swap` — the Cloudflare-tunneled endpoint returns 502 silently when the service is down

## Project status

LocalMaxxing is an actively-developed continuous project. If something looks broken or missing, DM the maintainer rather than papering over it locally. Refresh `/api/agent-context` periodically — new fields/endpoints land there first.
