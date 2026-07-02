#!/usr/bin/env bash
# Ground-truth verify a config: load llama-server, report per-card free VRAM,
# run a generation, test prompt-cache reuse, then shut down. This is the
# authoritative fit/headroom/correctness check — bench numbers don't prove a
# full-context config actually loads and survives prefill.
#
# Usage:
#   scripts/verify_load.sh <model.gguf> <devices> [llama-server flags...]
# Example:
#   scripts/verify_load.sh model.gguf 1,2 -ts 1/1 -np 1 -ctk f16 -ctv f16 -c 262144
#
# Exit 0 = loaded + generated. Nonzero = OOM/fail. Prints MIN free MiB across
# cards (your headroom). Compare against your chosen floor (e.g. 2048 MiB).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; source "$HERE/_common.sh"

MODEL="$1"; DEVICES="$2"; shift 2
PORT="${LLAMA_PORT:-8199}"
BIN="$(resolve_bin llama-server)"
LOG="$(mktemp)"

# enable prefix caching so the reuse test is meaningful, unless the caller
# explicitly disabled it or set their own value
cache_flag=(--cache-reuse 256)
[[ " $* " == *" --cache-reuse "* || " $* " == *" --no-cache-prompt "* ]] && cache_flag=()

GGML_VK_VISIBLE_DEVICES="$DEVICES" "$BIN" -m "$MODEL" -ngl 99 \
  --flash-attn auto --host 127.0.0.1 --port "$PORT" --no-webui \
  "${cache_flag[@]}" "$@" \
  > "$LOG" 2>&1 &
SRV=$!
cleanup() { kill "$SRV" 2>/dev/null; pkill -f "llama-server.*$PORT" 2>/dev/null; }
trap cleanup EXIT

for _ in $(seq 1 240); do
  grep -qE 'model loaded' "$LOG" && break
  grep -qiE 'out of memory|failed to alloc|ErrorOutOfDeviceMemory|cannot allocate' "$LOG" && {
    echo "FAIL: out of memory"; grep -iE 'out of memory|failed' "$LOG" | tail -2; exit 1; }
  kill -0 "$SRV" 2>/dev/null || { echo "FAIL: server died"; tail -5 "$LOG"; exit 1; }
  sleep 1
done
grep -qE 'model loaded' "$LOG" || { echo "FAIL: timeout"; tail -5 "$LOG"; exit 1; }

echo "OK: model loaded"
min=999999
for f in $(gpu_free "$DEVICES"); do echo "  card free: ${f} MiB"; (( f < min )) && min=$f; done
echo "  >>> MIN free across cards: ${min} MiB <<<"

# correctness + decode speed. reasoning models may put text in a separate
# channel (empty content) — count completion_tokens, not just content.
curl -s "http://127.0.0.1:$PORT/v1/chat/completions" -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Reply with one short sentence."}],"max_tokens":32,"temperature":0}' \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);m=d["choices"][0]["message"];c=m.get("content") or m.get("reasoning_content") or "";u=d.get("usage",{});t=d.get("timings",{});n=u.get("completion_tokens",0);print("  gen tokens:",n,"| text:",repr(c[:50]));print("  decode t/s:",round(t.get("predicted_per_second",0),1));sys.exit(0 if n>0 else 1)' \
  || { echo "FAIL: no tokens generated"; exit 1; }

# prompt-cache reuse: two identical requests with a long shared prefix.
# base64 -w0 = no line wrapping (wrapped newlines would break the JSON body).
PFX="$(head -c 6000 "$MODEL" | base64 -w0 | head -c 4000)"
BODY="{\"messages\":[{\"role\":\"user\",\"content\":\"Summarize this token blob in one word: $PFX\"}],\"max_tokens\":4,\"temperature\":0}"
for i in 1 2; do
  curl -s "http://127.0.0.1:$PORT/v1/chat/completions" -H 'Content-Type: application/json' -d "$BODY" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);u=d.get('usage',{});print('  req$i prompt_tokens:',u.get('prompt_tokens'),'cached:',u.get('prompt_tokens_details',{}).get('cached_tokens'))"
done
echo "  (req2 cached > 0 => prompt cache reuse works)"
