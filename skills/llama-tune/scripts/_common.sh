#!/usr/bin/env bash
# Sourced by bench.sh / verify_load.sh. Resolves llama.cpp binaries portably.
# Override order: $LLAMA_BIN_DIR > PATH > llama-swap config macro.
set -uo pipefail

CONFIG="${LLAMA_SWAP_CONFIG:-$HOME/.config/llama-swap/config.yaml}"

resolve_bin() {  # $1 = binary name (llama-server|llama-bench)
  local name="$1"
  if [[ -n "${LLAMA_BIN_DIR:-}" && -x "$LLAMA_BIN_DIR/$name" ]]; then
    echo "$LLAMA_BIN_DIR/$name"; return
  fi
  local p; p="$(command -v "$name" 2>/dev/null)" && { echo "$p"; return; }
  # parse the binary path out of the llama-swap macro (first absolute path
  # ending in llama-server), swap the basename for the requested binary
  if [[ -f "$CONFIG" ]]; then
    local srv; srv="$(grep -oE '/[^ ]*llama-server' "$CONFIG" | head -1)"
    [[ -n "$srv" && -x "${srv%/*}/$name" ]] && { echo "${srv%/*}/$name"; return; }
  fi
  echo "ERROR: cannot find $name. Set LLAMA_BIN_DIR." >&2; exit 1
}

# per-card free VRAM (MiB) for a given GGML_VK_VISIBLE_DEVICES list
gpu_free() {  # $1 = device list e.g. 0,1,2
  local srv; srv="$(resolve_bin llama-server)"
  GGML_VK_VISIBLE_DEVICES="$1" "$srv" --list-devices 2>/dev/null \
    | grep -oE '[0-9]+ MiB free' | grep -oE '^[0-9]+'
}
