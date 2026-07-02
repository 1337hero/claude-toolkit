# llama.cpp / llama-server tuning reference

Curated knobs that matter for placement, context, and throughput. Live docs:
- server flags: https://github.com/ggml-org/llama.cpp/tree/master/docs (see `docs/` and `tools/server/README.md`)
- full flag list: run `llama-server --help`

When a model needs a flag not covered here (new arch, special sampler), WebFetch
the live docs above rather than guessing.

## Placement / memory

| flag | what it does | tuning note |
|---|---|---|
| `-ngl 99` | offload all layers to GPU | always, unless intentionally CPU-offloading |
| `-ts a/b/c` | tensor-split ratio across visible devices | a `0` excludes that device. `0/1/1` = cards 1+2. Pipeline-parallel: for batch=1 only one GPU is active per token, so FEWER cards = less PCIe transfer = faster. Use the fewest cards the model fits on. **Uneven split** (e.g. `0.78/1/1`) puts less on a card that runs a desktop/compositor (~1-2 GiB already used) — needed to hold the headroom floor on that card for tight 3-card models. Don't push so far the other cards overflow. |
| `-sm row\|layer` | split mode | default `layer` (pipeline). `row` is tensor-parallel-ish, rarely faster on Vulkan; bench before trusting. |
| `GGML_VK_VISIBLE_DEVICES=0,1` (env) | hide cards from Vulkan | cleaner than `-ts 0/...` for truly freeing a card. In llama-swap, prefix the model `cmd` with it. |
| `--no-mmap` | load weights into RAM not mmap | only for models that must avoid mmap; costs RAM. |

## KV cache

| flag | what it does | tuning note |
|---|---|---|
| `-c N` | context length (KV slots) | cap at the model's native ctx (`model_info.py` prints it). |
| `-ctk`/`-ctv {f16,q8_0,q4_0}` | KV quant | `f16` = best quality, often EQUAL or faster decode (no dequant) when VRAM allows. `q8_0` = ~half the KV, near-lossless, slightly slower decode. `q4_0` only when desperate for ctx (quality hit). |
| `-fa {on,off,auto}` | flash attention | `auto`/`on` almost always. Required for quantized KV. |
| `-np N` | parallel slots | **set `-np 1` for single-user.** Each slot reserves its own context state; default >1 multiplies KV/SSM reservation and wastes VRAM. |

## Throughput

| flag | what it does | tuning note |
|---|---|---|
| `-b N` | logical batch (prefill) | default 2048. |
| `-ub N` | physical micro-batch | bigger = faster prefill, more compute-buffer VRAM. Sweep `512,1024,2048`; gains are model-specific and often small. |
| `--prio 3` | scheduler priority | keep as-is from existing config. |

## Prompt cache (huge for agentic/multi-turn)

- `--cache-reuse N` : reuse a matching prefix from a previous request (prefix
  caching). Big latency win across turns — a follow-up reprocesses only the new
  tokens, not the whole history.
- `--no-cache-prompt` : DISABLES the above. If present in a config, test whether
  it's still needed — it was often a stale workaround for old hybrid-cache bugs.
  Verify reuse works (`verify_load.sh` checks `cached_tokens > 0`) and remove it.

## Architecture gotchas (why KV estimates lie)

`model_info.py` flags these from metadata; they change the real footprint a lot:

- **MoE** (`expert_count`/`expert_used_count`): all experts must be VRAM-resident
  (weights = full file size), but decode only reads the *active* experts/token,
  so tok/s is high for the size (e.g. 80B-A3B decodes like a ~3B). Card count is
  driven by total weights, not active params.
- **Hybrid / SSM / DeltaNet** (any `*.ssm.*` keys, e.g. qwen3next, qwen35):
  recurrent layers hold a *constant* per-sequence state (doesn't grow with ctx);
  only the sparse full-attention layers have growing KV. Real KV ≪ the
  all-attention upper bound — full native context often fits cheaply.
- **SWA** (`attention.sliding_window`): windowed layers cap KV growth.
- **Net effect:** the KV/token "upper bound" from metadata is a conservative
  ceiling. The only trustworthy number is a real load test (`verify_load.sh`)
  reporting actual free VRAM.

## Hardware facts to remember

- For a single request (batch=1), spreading across more GPUs does NOT add
  decode bandwidth (pipeline-parallel, sequential per token) — it adds transfer
  overhead. Consolidate to the fewest cards that fit.
- **Exclusive-swap pool** (llama-swap `groups: {swap: true, exclusive: true}`):
  only ONE model is resident at a time, so "freeing a card" buys nothing for
  concurrency — fewer cards is purely a *speed* play (less pipeline overhead).
  Implication: bench mode → fewest cards (fastest); agentic mode → use as many
  cards as it takes to hold max context with headroom (the extra card is free).
- **KV size is wildly arch-dependent** — measured at full context on these
  cards: hybrid/SSM (qwen35moe, nemotron_h_moe) and MLA (deepseek2) are tiny
  (full 262K–1M fits easily); plain GQA dense/MoE (qwen3moe, qwen2, mistral3,
  granite, gemma-31B) are large (often can't fit full native ctx even on 2-3
  cards). Never assume from params; the load test decides.
- **Dense models are bandwidth-bound** (decode reads all weights/token) → slow,
  and benefit most from dropping a card. MoE with small active set decodes fast
  regardless of total size.
- The **main/first visible device holds extra buffers** (output, compute),
  so it runs tighter than the others. Headroom floor must be met on the
  *minimum* card, not the average.
- Read per-card capacity from `llama-server --list-devices` — never assume.
