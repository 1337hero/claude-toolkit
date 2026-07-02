# llama-swap config reference

Editing target for this skill. Live docs:
- https://github.com/mostlygeek/llama-swap/tree/main/docs
- config schema: https://github.com/mostlygeek/llama-swap/blob/main/README.md

Default config path: `~/.config/llama-swap/config.yaml` (override with
`$LLAMA_SWAP_CONFIG`).

## Structure

```yaml
healthCheckTimeout: 240       # secs to wait for a model to load before failing
startPort: 8100               # llama-swap assigns ${PORT} per model from here
env:
  - "GGML_VK_VISIBLE_DEVICES=0,1,2"   # global; per-model cmd can override

macros:                       # reusable text expanded into cmd via ${name}
  llama-server: |
    /path/to/llama-server
    --port ${PORT}
    --host 0.0.0.0
    -ngl 99
    --flash-attn auto
    ...

models:
  Model-Key:                  # the id clients send as {"model": "..."}
    name: "Human Readable"
    cmd: |
      ${llama-server}
      -m /path/to/model.gguf
      -ts 1/1/1
      -c 262144
      ...
    ttl: 600                  # secs idle before auto-unload

groups:                       # swap behavior
  vram:
    swap: true                # loading a member unloads the previous
    exclusive: true           # only one member resident at a time
    members: [Model-Key, ...]
```

## Editing rules for this skill

- Edit only the target model's `cmd:` block (and its leading comment). Leave
  macros, groups, and other models untouched.
- The `cmd` block is whitespace-joined into one command line, so each flag can
  go on its own line. `${llama-server}` expands first.
- To pin a model to specific cards, prefer `-ts` with `0` for excluded devices
  (matches the existing convention in this config). To *fully* free a card,
  prefix the cmd with `GGML_VK_VISIBLE_DEVICES=...` before `${llama-server}`.
- Add a short comment above the block summarizing the findings: chosen card
  count + why, KV choice, context, and the before→after tok/s. This is the
  project's house style (see existing Ornith/Gemma blocks).
- New model not yet in the config: copy the closest existing block, swap `-m`
  and the model key, then tune.
- After editing, the user restarts llama-swap to apply.
