#!/usr/bin/env -S uv run --with gguf --quiet python
"""Read GGUF metadata and estimate VRAM footprint for tuning.

Usage:
  scripts/model_info.py <model.gguf> [--vram-mib N] [--cards M]

Pass the FIRST shard of a multi-part GGUF; weights are summed across all shards
in the same directory. --vram-mib is usable VRAM per card (use the per-card
TOTAL from `llama-server --list-devices`, e.g. 30576); --cards is how many you
have. If given, prints min cards needed and a rough max-context estimate.

The KV/token figure is an UPPER BOUND: it assumes every layer is full attention
with no sliding-window. Real KV is far smaller for SWA, hybrid (SSM/DeltaNet),
and is constant-per-seq for recurrent layers. Treat numbers as a starting point
and confirm with a real load test (scripts/verify_load.sh).
"""
import sys, glob, os, re, math
import gguf

BYTES = {"f16": 2.0, "bf16": 2.0, "q8_0": 1.0625, "q5_1": 0.75, "q4_0": 0.5625}

def field(r, *names):
    for n in names:
        f = r.get_field(n)
        if f is not None:
            try: return f.contents()
            except Exception: pass
    return None

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    path = sys.argv[1]
    vram = cards = None
    for i, a in enumerate(sys.argv):
        if a == "--vram-mib": vram = int(sys.argv[i+1])
        if a == "--cards": cards = int(sys.argv[i+1])

    r = gguf.GGUFReader(path)
    arch = field(r, "general.architecture") or "?"
    p = arch  # metadata keys are prefixed with the arch name
    name = field(r, "general.name") or "?"
    n_layer = field(r, f"{p}.block_count")
    n_head = field(r, f"{p}.attention.head_count")
    n_kv = field(r, f"{p}.attention.head_count_kv")
    k_len = field(r, f"{p}.attention.key_length")
    v_len = field(r, f"{p}.attention.value_length")
    n_ctx_train = field(r, f"{p}.context_length")
    n_embd = field(r, f"{p}.embedding_length")
    n_expert = field(r, f"{p}.expert_count")
    n_used = field(r, f"{p}.expert_used_count")
    swa = field(r, f"{p}.attention.sliding_window")
    is_ssm = any(".ssm." in k for k in r.fields)

    # many archs (gemma, granite, qwen2/llama) omit key/value_length —
    # head_dim falls back to embedding_length / head_count
    if k_len is None and n_embd and n_head:
        k_len = v_len = n_embd // n_head

    # sum weights across shards
    base = re.sub(r"-0*\d+-of-0*\d+\.gguf$", "", path)
    shards = sorted(glob.glob(base + "*.gguf")) or [path]
    wbytes = sum(os.path.getsize(s) for s in shards)
    wgib = wbytes / 1024**3

    print(f"name             {name}")
    print(f"arch             {arch}")
    flags = []
    if n_expert: flags.append(f"MoE {n_used}/{n_expert} experts active")
    if is_ssm: flags.append("HYBRID (SSM/recurrent layers — small constant KV)")
    if swa: flags.append(f"SWA window={swa}")
    print(f"type             {', '.join(flags) if flags else 'dense attention'}")
    print(f"weights          {wgib:.2f} GiB ({len(shards)} shard(s))")
    # head_count_kv may be a per-layer array (e.g. gemma SWA: full vs sliding)
    if isinstance(n_kv, list):
        kv_total = sum(n_kv)
        kv_desc = "+".join(f"{n_kv.count(v)}x{v}" for v in sorted(set(n_kv), reverse=True))
    else:
        kv_total = (n_kv or 0) * (n_layer or 0)
        kv_desc = str(n_kv)
    print(f"layers           {n_layer}")
    print(f"kv heads         {kv_desc} (total {kv_total}, head_count {n_head})")
    print(f"head dim k/v     {k_len}/{v_len}")
    print(f"native ctx       {n_ctx_train}")

    if kv_total and k_len is not None and v_len is not None:
        elem = kv_total * (k_len + v_len)
        print("\nKV/token UPPER BOUND (all-attention assumption — real is less):")
        for q in ("f16", "q8_0"):
            kib = elem * BYTES[q] / 1024
            print(f"  {q:5s} {kib:7.1f} KiB/token   "
                  f"@{n_ctx_train//1024}K = {kib*n_ctx_train/1024/1024:6.2f} GiB")

        if vram and cards:
            usable = vram / 1024  # GiB, raw total; leave headroom below
            print(f"\nHardware: {cards}× {usable:.1f} GiB = {usable*cards:.1f} GiB total")
            min_c = math.ceil(wgib / (usable * 0.97))
            print(f"min cards for weights: {min_c}  "
                  f"(weights {wgib:.1f} / ~{usable*0.97:.1f} usable per card)")
            for nc in range(min_c, cards + 1):
                for head in (2.0, 1.0):  # GiB/card headroom: conservative, squeeze
                    free = usable * nc - wgib - head * nc
                    if free <= 0: continue
                    for q in ("f16", "q8_0"):
                        kib = elem * BYTES[q] / 1024
                        ctx = int(free * 1024 * 1024 / kib)
                        cap = min(ctx, n_ctx_train)
                        print(f"  {nc} card / {head:.0f}GiB headroom / {q:4s} KV "
                              f"-> ~{cap//1024}K ctx (upper-bound floor)")

if __name__ == "__main__":
    main()
