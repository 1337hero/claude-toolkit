---
name: llama-tune
description: "Empirically tune GGUF model's llama-swap/llama.cpp config for multi-GPU rig — card placement, KV-cache quant, context length, batch sizes, prompt-cache settings. Benchmarks each dial one at a time, verifies with real load. Checks Hugging Face model card for sampling/template. Modes: \"bench\" (max tok/s, benchmark-maxxing), \"agentic\" (max context + safe VRAM headroom for coding agents). Use when user wants to tune, optimize, speed up, or fit local LLM (llama.cpp / llama-server / llama-swap / GGUF) on GPUs — \"tune a model for speed\", \"max out context for a model\", \"what settings for this model\", \"optimize my llama-swap config\", \"dial in tok/s\"."
disable-model-invocation: true
---

# llama-tune

Tune one model's config the way it's actually done: measure, don't guess. Read
the model's architecture, find its recommended settings, then change ONE dial at
a time and benchmark, confirm the winners work together, and verify a real load
fits with headroom before writing the config.

## Before anything: don't contend for the GPU

Benchmarks are meaningless if something else is using the cards. **Confirm the
rig is idle before any bench or load** (`llama-server --list-devices` should show
cards near-fully free; ask the user if unsure). CPU-only steps (reading
metadata, editing config) are always safe.

## Pick the mode

Ask the user which, if not stated:

- **bench** — maximize tok/s for leaderboard/benchmark runs. Smallest card
  footprint that fits, context only as large as needed, KV quant chosen purely
  for speed. Squeeze.
- **agentic** — maximize usable context for a coding agent, kept reliable.
  Largest context the model (native cap) and hardware allow, **prompt cache ON**,
  KV quant that preserves quality, and a VRAM headroom floor so it won't OOM mid
  run.

## Workflow

### 1. Resolve the model + read its architecture (CPU only)

Find the GGUF path (from the llama-swap config key, or ask). Then:

```
scripts/model_info.py <model.gguf> --vram-mib <per-card-total> --cards <N>
```

Get `--vram-mib` (per-card TOTAL) and `--cards` from `llama-server
--list-devices`. This prints arch, weights size, layers, KV heads, native
context, MoE/SSM/SWA flags, KV/token, **min cards needed**, and rough
max-context floors per (cards, headroom, KV-quant).

Read `references/llama-cpp.md` "Architecture gotchas" — MoE, hybrid/SSM, and SWA
make the KV estimate a loose upper bound; real footprint is usually much smaller,
so the only trustworthy fit number comes from step 5.

### 2. Look up the Hugging Face model card

Search/fetch `https://huggingface.co/<org>/a model` (and the GGUF repo, e.g.
unsloth/bartowski) for **recommended inference settings**: temperature, top-p,
top-k, min-p, repeat-penalty, chat template / `--chat-template-kwargs`,
reasoning format, and any "must use these" notes. Use WebFetch. These set the
sampling flags; the skill tunes performance, not quality — keep the card's
sampling unless the user says otherwise.

### 3. Detect hardware + set the target

From `--list-devices`: card count and per-card total/free VRAM (don't assume —
rigs differ). For **agentic** mode, ask the user **squeeze vs conservative**
headroom and set a floor (e.g. ~1 GiB squeeze, ~2 GiB balanced, ~3 GiB
conservative) that must hold on the *tightest* card (the main device runs
tighter — see references/llama-cpp.md).

### 4. Bench each dial — ONE at a time

Establish a baseline (current config), then change a single dial and re-bench.
Use `scripts/bench.sh a model <devices> <ts> [flags]` (prints clean pp/tg rows).
Dials, in rough priority:

1. **Card count** — fewest cards the weights fit on (min from step 1). For
   batch=1, fewer cards = faster (pipeline overhead). Bench 3-card vs 2-card vs
   1-card as applicable.
2. **KV quant** — `f16` vs `q8_0` (`-ctk/-ctv`). f16 is often equal/faster and
   higher quality when it fits; q8_0 when context needs the space.
3. **ubatch** — `-ub 512,1024,2048` for prefill (llama-bench accepts a list).
4. **flash-attn**, **-sm row** — only if a model misbehaves or to squeeze more.

Record what helps / hurts / is neutral. Keep gains that are real (outside the
± noise) and free.

### 5. Combine winners + verify a real load (ground truth)

Benchmarks don't prove a full-context config loads and survives prefill. Take
the winning dials together and run:

```
scripts/verify_load.sh a model <devices> -ts ... -np 1 -ctk ... -c <ctx> ...
```

It reports **MIN free VRAM across cards**, runs a generation, and checks
prompt-cache reuse. Require:
- loads + generates coherently,
- MIN free ≥ your headroom floor (agentic) — if not, drop context or add a card,
- for agentic: `req2 cached_tokens > 0` (prompt cache reuse working). If a config
  has `--no-cache-prompt`, test removing it (see references/llama-cpp.md).

For **bench** mode, also bench at the workload the leaderboard uses (matching
prompt/output token counts) so the reported numbers line up.

### 6. Apply + re-verify

Edit only the target model's `cmd:` block in the llama-swap config (see
`references/llama-swap.md` for structure and house rules), add `-np 1`, set the
tuned flags, and write a comment summarizing: card count + why, KV choice,
context, before→after tok/s. Then run `verify_load.sh` once more on the
final block to confirm. Tell the user to restart llama-swap.

## Mode decision cheatsheet

| dial | bench (max tps) | agentic (max ctx, reliable) |
|---|---|---|
| card count | fewest that fit (fastest) | fewest that fit *with headroom at full ctx* |
| context | only as large as the bench needs | model native cap, as high as headroom allows |
| KV quant | whichever decodes faster | f16 if it fits, else q8_0 (preserve quality) |
| `-np` | 1 | 1 |
| prompt cache | off is fine (single-shot) | **on** (`--cache-reuse`, no `--no-cache-prompt`) |
| headroom | minimal | enforce the floor on the tightest card |

## Scripts

- `scripts/model_info.py` — GGUF metadata + footprint/min-cards/ctx estimate. CPU only. Runs via `uv run --with gguf`.
- `scripts/bench.sh` — llama-bench wrapper, clean result rows. GPU.
- `scripts/verify_load.sh` — load + headroom + generation + cache-reuse check, then shuts down. GPU.

All three resolve the llama.cpp binaries via `$LLAMA_BIN_DIR`, then `PATH`, then
by parsing the llama-swap config macro (`scripts/_common.sh`).

## References

- `references/llama-cpp.md` — flag-by-flag tuning knobs, KV math, arch gotchas, hardware facts.
- `references/llama-swap.md` — config.yaml structure and editing rules.
