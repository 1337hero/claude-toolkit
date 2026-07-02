#!/usr/bin/env bash
# Benchmark one dial config with llama-bench. Prints only the result rows.
#
# Usage:
#   scripts/bench.sh <model.gguf> <devices> <ts> [extra llama-bench flags...]
# Example (3-card, q8_0 KV, prefill+decode):
#   scripts/bench.sh model.gguf 0,1,2 1/1/1 -ctk q8_0 -ctv q8_0 -p 512 -n 256
# Example (single card): devices=2, ts omitted as "-"  (no -ts passed)
#   scripts/bench.sh model.gguf 2 - -p 512 -n 256
#
# Change ONE dial per call. Defaults: -fa 1 -r 3 -p 512 -n 256 if -p/-n unset.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; source "$HERE/_common.sh"

MODEL="$1"; DEVICES="$2"; TS="$3"; shift 3
BIN="$(resolve_bin llama-bench)"
args=(-m "$MODEL" -ngl 99 -fa 1)
[[ "$TS" != "-" ]] && args+=(-ts "$TS")
# default workload + repeats unless caller overrides
[[ " $* " == *" -p "* ]] || args+=(-p 512)
[[ " $* " == *" -n "* ]] || args+=(-n 256)
[[ " $* " == *" -r "* ]] || args+=(-r 3)
args+=("$@")

echo ">>> bench devices=$DEVICES ts=$TS ${*}"
GGML_VK_VISIBLE_DEVICES="$DEVICES" "$BIN" "${args[@]}" 2>/dev/null \
  | grep -E '\|.*(pp[0-9]+|tg[0-9]+|test)\s*\|'
